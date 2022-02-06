import React, { useState, useEffect } from 'react';
import { Platform, TouchableOpacity, ScrollView, Alert, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ProductNavigationProps } from '@src/@types/navigation';

import { ButtonBack } from '@components/ButtonBack';
import { Photo } from '@components/Photo';
import { InputPrice } from '@components/InputPrice';
import { Input } from '@components/Input';
import { Button } from '@components/Button';

import {
  Container,
  Header,
  Title,
  DeleteLabel,
  Upload,
  PickImageButton,
  Form,
  Label,
  InputGroup,
  InputGroupHeader,
  MaxCharacters,
} from './styles';
import { ProductProps } from '@components/ProductCard';

type PizzaResponse = ProductProps & {
  photo_path: string;
  price_sizes: {
    p: string;
    m: string;
    g: string;
  }
}

export function Product() {
  const [isLoading, setIsLoading] = useState(false);
  const [image, setImage] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [priceP, setPriceP] = useState('');
  const [priceM, setPriceM] = useState('');
  const [priceG, setPriceG] = useState('');
  const [photoPath, setPhotoPath] = useState('');
  const navigation = useNavigation();

  const route = useRoute();
  const { id } = route.params as ProductNavigationProps;

  async function handlePickerImage() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status === 'granted') {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        aspect: [4, 4],
      });

      if (!result.cancelled) {
        setImage(result.uri);
      }
    }
  }

  async function handleAdd() {
    const formTitle = 'Cadastro';
    if (!name.trim()) {
      return Alert.alert(formTitle, 'Informe o nome.');
    }

    if (!description.trim()) {
      return Alert.alert(formTitle, 'Informe a descrição.');
    }

    if (!image) {
      return Alert.alert(formTitle, 'Selecione uma imagem.');
    }

    if (!priceP.trim() || !priceM.trim() || !priceG.trim()) {
      return Alert.alert(formTitle, 'Informe o preço de todos os tamanhos.');
    }

    setIsLoading(true);

    const fileName = new Date().getTime();
    const reference = storage().ref(`/pizzas/${fileName}.png`);

    await reference.putFile(image);
    const photo_url = await reference.getDownloadURL();

    return firestore()
      .collection('pizzas')
      .add({
        name,
        name_insensitive: name.toLowerCase().trim(),
        description,
        price_sizes: {
          p: priceP,
          m: priceM,
          g: priceG,
        },
        photo_url,
        photo_path: reference.fullPath,
      })
      .then(() => navigation.navigate('home'))
      .catch(() => Alert.alert(formTitle, 'Não foi possível cadastrar'))
      .finally(() => setIsLoading(false));
  }

  function handleGoBack() {
    navigation.goBack();
  }

  function handleDelete() {
    firestore()
    .collection('pizzas')
    .doc(id)
    .delete()
    .then(() => {
        storage()
        .ref(photoPath)
        .delete()
        .then(() => navigation.navigate('home'))
    });
  }

  useEffect(() => {
    if (id) {
       firestore()
       .collection('pizzas')
       .doc(id)
       .get()
       .then((response) => {
         const product = response.data() as PizzaResponse;

         setName(product.name);
         setImage(product.photo_url);
         setDescription(product.description);
         setPriceP(product.price_sizes.p);
         setPriceM(product.price_sizes.m);
         setPriceG(product.price_sizes.g);
         setPhotoPath(product.photo_path);
       })
    }
  }, [id])

  return (
    <Container behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Header>
        <ButtonBack onPress={handleGoBack}/>
        <Title>Cadastrar</Title>
        {
          id
          ?
          <TouchableOpacity onPress={handleDelete}>
            <DeleteLabel>Deletar</DeleteLabel>
          </TouchableOpacity>
          : <View />
        }
      </Header>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Upload>
          <Photo uri={image} />
          {
            !id &&
            <PickImageButton
              title="Carregar"
              type="secondary"
              onPress={handlePickerImage}
            />
          }
        </Upload>
        <Form>
          <InputGroup>
            <Label>Nome</Label>
            <Input onChangeText={setName} value={name} />
          </InputGroup>
          <InputGroup>
            <InputGroupHeader>
              <Label>Descrição</Label>
              <MaxCharacters>{description.length} de 60 caracteres</MaxCharacters>
            </InputGroupHeader>
            <Input
              multiline
              maxLength={60}
              style={{ height: 80 }}
              onChangeText={setDescription}
              value={description}
            />
          </InputGroup>
          <InputGroup>
            <Label>Tamanhos e preços</Label>
            <InputPrice size="P" onChangeText={setPriceP} value={priceP} />
            <InputPrice size="M" onChangeText={setPriceM} value={priceM} />
            <InputPrice size="G" onChangeText={setPriceG} value={priceG} />
          </InputGroup>
          {!id &&
            <Button
             title="Cadastrar pizza"
             onPress={handleAdd}
             isLoading={isLoading}
           />
          }
        </Form>
      </ScrollView>
    </Container>
  );
}
