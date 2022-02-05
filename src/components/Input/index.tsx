import React from 'react';
import { TextInputProps } from 'react-native';

import { Container, TypeProps } from './styles';

type InputProps = TextInputProps & {
  type?: TypeProps;
};

export function Input({ type = 'primary', ...rest}: InputProps) {
  return <Container type={type} {...rest} />
}
