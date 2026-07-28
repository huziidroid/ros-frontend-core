/** Alert/toast port. Satisfiable by a web toast stack or native `Alert.alert`. */
export enum AlertVariant {
  Info = 'info',
  Success = 'success',
  Warning = 'warning',
  Error = 'error',
}

export enum AlertActionStyle {
  Default = 'default',
  Cancel = 'cancel',
  Destructive = 'destructive',
}

export interface AlertAction {
  label: string;
  style?: AlertActionStyle;
  onPress?: () => void;
}

export interface AlertRequest {
  title?: string;
  message: string;
  /** Defaults to `AlertVariant.Info` at the adapter's discretion. */
  variant?: AlertVariant;
  actions?: AlertAction[];
  /** Auto-dismiss after N ms. Toast-only. */
  duration?: number;
}

export type AlertId = string;

export interface AlertService {
  /** Fire-and-forget alert/toast. Returns an id for targeted `hide`. */
  show(request: AlertRequest): AlertId;
  /** Dismiss one alert by id, or all when `id` is omitted. */
  hide(id?: AlertId): void;
  /** Blocking OK/Cancel decision. Resolves `true` when confirmed. */
  confirm(request: Omit<AlertRequest, 'actions' | 'duration'>): Promise<boolean>;
}

export enum ToastPosition {
  Top = 'top',
  Bottom = 'bottom',
  TopRight = 'top-right',
  BottomRight = 'bottom-right',
}

/** Web-only extras. Intersect with `AlertRequest` at web call sites. */
export interface WebToastOptions {
  position?: ToastPosition;
  richContent?: boolean;
}

/** Native-only extras. Intersect with `AlertRequest` at native call sites. */
export interface NativeAlertOptions {
  cancelable?: boolean;
  onDismiss?: () => void;
}
