import { useEffect } from 'react';
import { useAppCoreContext } from '@ros/core';
import { Button } from '@ros/ui-web';

export function HomeRoute() {
  const { accountInfo, navigationService } = useAppCoreContext();

  useEffect(() => {
    if (!accountInfo.user) navigationService.replace('Login');
  }, [accountInfo.user, navigationService]);

  if (!accountInfo.user) return null;

  return (
    <div>
      ros-web
      <Button>Click me</Button>
    </div>
  );
}

export default HomeRoute;
