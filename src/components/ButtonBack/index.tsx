import React from 'react';
import { TouchableOpacityProps } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from 'styled-components/native';
import { Container } from './style';

export function ButtonBack( { ...rest }: TouchableOpacityProps) {
  const { COLORS } = useTheme();

  return (
    <Container {...rest}>
      <MaterialIcons name="chevron-left" color={COLORS.TITLE} size={18} />
    </Container>
  );
}