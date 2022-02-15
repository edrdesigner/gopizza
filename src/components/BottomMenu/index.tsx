import React from 'react';

import { Container, Title, Notification, Quantity } from './styles';

type Props = {
  title: string;
  color: string;
  notification?: string | undefined;
}

export function BottomMenu({ title, color, notification}: Props) {
  const noNotifications = notification === '0';

  return (
    <Container>
      <Title color={color}>{title}</Title>
      {
        notification && (
          <Notification noNotifications={noNotifications}>
            <Quantity noNotifications={noNotifications}>{notification}</Quantity>
          </Notification>
        )
      }
    </Container>
  )
}
