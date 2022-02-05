import React, { useEffect, useState } from 'react';
import { Alert, TouchableOpacity, FlatList } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import firestore from '@react-native-firebase/firestore';
import { useTheme } from 'styled-components/native';
import { Search } from '@components/Search';
import { ProductCard, ProductProps } from '@components/ProductCard';

import happyEmoji from '@assets/happy.png';

import {
  Container,
  Header,
  Greeting,
  GreetingEmoji,
  GreetingText,
  MenuHeader,
  MenuTitle,
  MenuItemsNumber
} from './styles';

export function Home() {
  const [pizzas, setPizzas] = useState<ProductProps[]>([]);
  const [search, setSearch] = useState('');
  const { COLORS } = useTheme();

  function fetchPizzas(value?: string) {
    const formattedValue = value?.toLocaleLowerCase()?.trim() ?? '';

    firestore()
      .collection('pizzas')
      .orderBy('name_insensitive')
      .startAt(formattedValue)
      .endAt(`${formattedValue}\uf8ff`)
      .get()
      .then(response => {
        const data = response.docs.map(doc => {
          return {
            id: doc.id,
            ...doc.data(),
          }
        }) as ProductProps[];

        setPizzas(data);
      })
      .catch(() => Alert.alert('Não foi possivel realizar a consulta'));
  }

  function handleSearch() {
    fetchPizzas(search);
  }

  function handleSearchClear() {
    setSearch('');
    fetchPizzas('');
  }

  useEffect(() => {
    fetchPizzas(search);
  }, [])

  return (
    <Container>
      <Header>
        <Greeting>
          <GreetingEmoji source={happyEmoji} />
          <GreetingText>Olá, Admin</GreetingText>
        </Greeting>
        <TouchableOpacity>
          <MaterialIcons name="logout" color={COLORS.TITLE} size={24} />
        </TouchableOpacity>
      </Header>
      <Search
        onChangeText={setSearch}
        value={search}
        onSearch={handleSearch}
        onClear={handleSearchClear}
      />
      <MenuHeader>
        <MenuTitle>Cardápio</MenuTitle>
        <MenuItemsNumber>110 pizzas</MenuItemsNumber>
      </MenuHeader>
      <FlatList
        data={pizzas}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <ProductCard data={item} />}
        contentContainerStyle={{
          paddingTop: 20,
          paddingBottom: 125,
          marginHorizontal: 24,
        }}
        showsVerticalScrollIndicator={false}
      />
    </Container>
  );
}
