import React , { useState, ChangeEvent, useEffect }  from 'react';
import { Feather as Icon } from '@expo/vector-icons';
import { View, Image, ImageBackground, StyleSheet, Text, KeyboardAvoidingView, Platform } from 'react-native';
import { RectButton, TextInput } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';
import RNPickerSelect from 'react-native-picker-select';
import api from '../../services/api';

interface Uf{
  id: number,
  sigla: string,
  nome:string
}

interface Cidade{
  id: number,
  nome:string
}

const Home = () =>{
    const navigation = useNavigation();
    const [selectedUf, setSelectedUF] = useState('0');
    const [selectedCidade, setSelectedCidade] = useState('0');
    const [ufs, setUfs] = useState<Uf[]>([]);
    const [cidades, setCidades] = useState<Cidade[]>([]);

    useEffect(() =>{
      api.get('https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome').then(response =>{
          setUfs(response.data);
          //console.log(ufs);
      })
    },[] );

    useEffect(() => {
        if(selectedUf==='0'){
            return;
        }
        api.get(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios?orderBy=nome`).then(response =>{
            setCidades(response.data);

        })
    },[selectedUf])

    function handleNavigationToPoints(){
      navigation.navigate('Points', {
        uf: selectedUf,
        city: selectedCidade
      });
    }

    function handleSelectUF(event: ChangeEvent<HTMLSelectElement>){
      const uf = event.target.value;
      setSelectedUF(uf);
    }
    
    function handleSelectCidade(event: ChangeEvent<HTMLSelectElement>){
        const cidade = event.target.value;
        setSelectedCidade(cidade);
    }

    return (
        <KeyboardAvoidingView style={{ flex:1 }} behavior={Platform.OS === 'ios' ? 'padding': undefined}>
          <ImageBackground source={require('../../assets/home-background.png')} 
            imageStyle={{ width: 274, height: 368}}
            style={styles.container}
          >
            <View style={styles.main}>
              <Image source={require('../../assets/logo.png')} />
              <View>
                <Text style={styles.title}>Seu marketplace de coleta de resíduos</Text>
                <Text style={styles.description}>Ajudamos pessoas a encontrarem pontos de coleta de forma eficiente.</Text>                
              </View>
            </View>
            <View style={styles.footer}>
                <TextInput 
                  style={styles.input}
                  placeholder="Digite a UF"
                />
                <TextInput 
                  style={styles.input}
                  placeholder="Digite a Cidade"
                />

                <RectButton style={styles.button} onPress={handleNavigationToPoints}>
                  <View style={styles.buttonIcon}>
                    <Text>
                      <Icon name="arrow-right" color="#FFF" size={24} />
                    </Text>
                  </View>
                  <Text style={styles.buttonText}>Entrar</Text>
                </RectButton>
            </View>
          </ImageBackground>
        </KeyboardAvoidingView>
    )
};

const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 32,
      //backgroundColor: '#f0f0f5' -> movido para routes.tsx para ficar uma cor global
    },
  
    main: {
      flex: 1,
      justifyContent: 'center',
    },
  
    title: {
      color: '#322153',
      fontSize: 32,
      fontFamily: 'Ubuntu_700Bold',
      maxWidth: 260,
      marginTop: 64,
    },
  
    description: {
      color: '#6C6C80',
      fontSize: 16,
      marginTop: 16,
      fontFamily: 'Roboto_400Regular',
      maxWidth: 260,
      lineHeight: 24,
    },
  
    footer: {},
  
    select: {},
  
    input: {
      height: 60,
      backgroundColor: '#FFF',
      borderRadius: 10,
      marginBottom: 8,
      paddingHorizontal: 24,
      fontSize: 16,
    },
  
    button: {
      backgroundColor: '#34CB79',
      height: 60,
      flexDirection: 'row',
      borderRadius: 10,
      overflow: 'hidden',
      alignItems: 'center',
      marginTop: 8,
    },
  
    buttonIcon: {
      height: 60,
      width: 60,
      backgroundColor: 'rgba(0, 0, 0, 0.1)',
      justifyContent: 'center',
      alignItems: 'center'
    },
  
    buttonText: {
      flex: 1,
      justifyContent: 'center',
      textAlign: 'center',
      color: '#FFF',
      fontFamily: 'Roboto_500Medium',
      fontSize: 16,
    }
  });
  
export default Home;