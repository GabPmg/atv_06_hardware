import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Image, FlatList, StyleSheet, SafeAreaView, StatusBar, ActivityIndicator } from 'react-native';
import axios from 'axios';
import * as Voice from 'expo-voice'; 
import { Audio } from 'expo-av';  

const API_KEY = '860d240af05f1e0def8cda208fc17771';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_BASE_URL = 'https://image.tmdb.org/t/p/w500';

const App = () => {
  const [query, setQuery] = useState('');
  const [movies, setMovies] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Função para verificar permissões de microfone
  const requestPermissions = async () => {
    const { status } = await Audio.requestPermissionsAsync();
    if (status !== 'granted') {
      alert('Permissão para acessar o microfone é necessária!');
    }
  };

  useEffect(() => {
    requestPermissions();
    // Configuração dos eventos do Voice
    Voice.onSpeechResults = (e) => {
      setQuery(e.value[0]);  // Captura o primeiro resultado de fala
      fetchMovies(e.value[0]);  // Chama a função para buscar os filmes com a consulta de voz
      setIsListening(false);  // Desativa o botão de escuta
    };

    Voice.onSpeechError = (e) => {
      console.error('Erro ao reconhecer a fala:', e);
      setIsListening(false);  // Caso ocorra erro, desativa o botão
    };

    return () => {
      Voice.removeAllListeners();  // Limpa os listeners quando o componente for desmontado
    };
  }, []);

  // Função para buscar filmes
  const fetchMovies = async (searchQuery) => {
    if (!searchQuery) return; // Evita busca vazia
    setLoading(true);
    setError(null);
    try {
      const url = `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(searchQuery)}&language=pt-BR`;
      const response = await axios.get(url);
      if (response.data.results.length === 0) {
        setError('Nenhum filme encontrado.');
      } else {
        setMovies(response.data.results);
      }
    } catch (error) {
      setError('Erro ao buscar filmes.');
      console.error('Erro ao buscar filmes:', error);
    } finally {
      setLoading(false);
    }
  };

  // Iniciar a captura de voz
  const startListening = async () => {
    setIsListening(true);
    try {
      await Voice.startListening();  // Inicia a escuta
    } catch (error) {
      console.error('Erro ao iniciar escuta de voz:', error);
    }
  };

  // Parar de ouvir
  const stopListening = async () => {
    try {
      await Voice.stopListening();  // Para a escuta
      setIsListening(false);
    } catch (error) {
      console.error('Erro ao parar escuta de voz:', error);
    }
  };

  // Função para renderizar os filmes
  const renderMovie = ({ item }) => (
    <View style={styles.movieContainer}>
      <Image
        source={{ uri: `${IMG_BASE_URL}${item.poster_path}` }}
        style={styles.movieImage}
      />
      <Text style={styles.movieTitle}>{item.title}</Text>
      <Text style={styles.movieOverview}>{item.overview || 'Descrição não disponível'}</Text>
      <Text style={styles.movieYear}>
        <Text style={styles.boldText}>Ano:</Text> {item.release_date ? item.release_date.split('-')[0] : 'N/A'}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <View style={styles.container}>
        <TextInput
          style={styles.input}
          placeholder="Digite o nome do filme..."
          placeholderTextColor="#888"
          value={query}
          onChangeText={setQuery}
        />
        <Button title="Buscar" onPress={() => fetchMovies(query)} color="#1E90FF" />
        
        {/* Indicador de Carregamento */}
        {loading && <ActivityIndicator size="large" color="#1E90FF" style={styles.loader} />}
        
        {/* Exibição de mensagem de erro */}
        {error && <Text style={styles.errorText}>{error}</Text>}

        {/* Botão de captura de voz */}
        <Button
          title={isListening ? 'Parar de Ouvir' : 'Falar'}
          onPress={isListening ? stopListening : startListening}
          color="#FF6347"
        />

        <FlatList
          data={movies}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderMovie}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000',
  },
  container: {
    flex: 1,
    padding: 20,
  },
  input: {
    height: 40,
    borderColor: '#444',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 8,
    borderRadius: 5,
    color: '#fff',
    backgroundColor: '#333',
  },
  loader: {
    marginTop: 20,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    marginTop: 10,
  },
  movieContainer: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#444',
    paddingBottom: 10,
  },
  movieImage: {
    width: '100%',
    height: 300,
    resizeMode: 'cover',
    marginBottom: 10,
  },
  movieTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  movieOverview: {
    color: '#ddd',
  },
  movieYear: {
    color: '#fff',
  },
  boldText: {
    fontWeight: 'bold',
    color: '#fff',
  },
});

export default App;
