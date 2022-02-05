import React from 'react';
import { TextInputProps } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from 'styled-components/native';

import { Button, ButtonClear, Container, Input, InputArea } from './styles';

type SearchProps = TextInputProps & {
  onSearch: () => void;
  onClear: () => void;
}

export function Search({ onSearch, onClear, ...rest}: SearchProps) {
  const { COLORS } = useTheme();

  return (
    <Container>
      <InputArea>
        <Input placeholder="Search" {...rest} />
        <ButtonClear onPress={onClear}>
          <Feather name="x" size={16} />
        </ButtonClear>
      </InputArea>
      <Button onPress={onSearch}>
        <Feather name="search" size={16} color={COLORS.TITLE} />
      </Button>
    </Container>
  )
}
