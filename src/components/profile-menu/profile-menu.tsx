import { useState } from 'react';
import type { FC } from 'react'
import { useLocation, useNavigate } from 'react-router-dom';
import { ProfileMenuUI } from '@ui';
import { useAppDispatch } from '../../services/store';
import { logoutUser } from '../../services/slices/userSlice';

export const ProfileMenu: FC = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [logoutError, setLogoutError] = useState('');

  const handleLogout = async () => {
    setLogoutError('');
    try {
      await dispatch(logoutUser()).unwrap();
      navigate('/login', { replace: true });
    } catch {
      setLogoutError('Не удалось выйти из аккаунта');
    }
  };

  return (
    <ProfileMenuUI
      handleLogout={handleLogout}
      pathname={pathname}
      logoutError={logoutError}
    />
  );
};