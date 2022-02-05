import React from 'react';

import { Image, Placeholder, PlaceholderTitle } from './styles';

type PhotoProps = {
  uri: string | null;
}

export function Photo({ uri }: PhotoProps) {
  if (uri) {
    return <Image source={{ uri }} />
  }

  return (
    <Placeholder>
      <PlaceholderTitle>
        Nenhuma foto {'\n'}
        carregada
      </PlaceholderTitle>
    </Placeholder>
  )
}