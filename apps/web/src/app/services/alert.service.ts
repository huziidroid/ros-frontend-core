/** Web `AlertService`, backed by sonner. `confirm` still uses `window.confirm`. */
import { toast } from 'sonner';
import {
  AlertVariant,
  type AlertAction,
  type AlertId,
  type AlertRequest,
  type AlertService,
} from '@ros/types';

function toSonnerAction(action?: AlertAction) {
  if (!action) return undefined;
  return { label: action.label, onClick: () => action.onPress?.() };
}

// sonner supports one action + one cancel button, not an arbitrary list —
// the first 'cancel'-styled action maps to sonner's cancel slot, the first
// remaining action maps to its single action slot.
function pickActions(actions: AlertAction[] = []) {
  const cancelAction = actions.find((a) => a.style === 'cancel');
  const primaryAction = actions.find((a) => a !== cancelAction);
  return { cancelAction, primaryAction };
}

export class WebAlertService implements AlertService {
  show(request: AlertRequest): AlertId {
    const { cancelAction, primaryAction } = pickActions(request.actions);
    const options = {
      description: request.title ? request.message : undefined,
      duration: request.duration,
      action: toSonnerAction(primaryAction),
      cancel: toSonnerAction(cancelAction),
    };
    const title = request.title ?? request.message;

    let id: string | number;
    switch (request.variant) {
      case AlertVariant.Success:
        id = toast.success(title, options);
        break;
      case AlertVariant.Warning:
        id = toast.warning(title, options);
        break;
      case AlertVariant.Error:
        id = toast.error(title, options);
        break;
      case AlertVariant.Info:
      default:
        id = toast.info(title, options);
    }
    return String(id);
  }

  hide(id?: AlertId): void {
    toast.dismiss(id);
  }

  confirm(
    request: Omit<AlertRequest, 'actions' | 'duration'>,
  ): Promise<boolean> {
    return Promise.resolve(window.confirm(request.message));
  }
}
