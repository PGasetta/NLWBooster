import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import { FiArrowLeft } from 'react-icons/fi';
import { Link, useHistory } from 'react-router-dom'
import { Map, TileLayer, Marker, Popup } from 'react-leaflet';
import { LeafletMouseEvent } from 'leaflet';
import axios from 'axios';
import api from '../../services/api';
import Dropzone from '../../components/Dropzone';

import './styles.css';
import logo from '../../assets/logo.svg';

interface Item{
    id: number,
    title: string,
    image_url: string
}

interface Uf{
    id: number,
    sigla: string,
    nome:string
}

interface Cidade{
    id: number,
    nome:string
}


const CreatePoint = () =>{
    const [selectedUf, setSelectedUF] = useState('0');
    const [selectedCidade, setSelectedCidade] = useState('0');
 
    const [items, setItems] = useState<Item[]>([]);
    const [ufs, setUfs] = useState<Uf[]>([]);
    const [cidades, setCidades] = useState<Cidade[]>([]);

    const [ initialPosition, setInitialPosition] = useState<[number,number]>([0,0]);
    const [ selectedPosition, setSelectedPosition] = useState<[number,number]>([0,0]);
    const [ selectedItems, setSelectedItems] = useState<number[]>([]);

    const [selectFile, setSelectFile] = useState<File>();

    const [formData, setFormData] = useState({ 
        name: '',
        email:'',
        whatsapp: '',
    });

    const history = useHistory();

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(position =>{
            const { latitude, longitude } = position.coords;
            setInitialPosition([latitude,longitude]);
            console.log(selectedPosition);
        })
    },[]);

    useEffect(() => {
        api.get('items').then(response => {
            setItems(response.data);
        })
    }, []);
    
    useEffect(() =>{
        axios.get('https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome').then(response =>{
            setUfs(response.data);
            //console.log(response.data);
        })
    },[] );

    useEffect(() => {
        if(selectedUf==='0'){
            return;
        }
        axios.get(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios?orderBy=nome`).then(response =>{
            setCidades(response.data);

        })
    },[selectedUf])

    function handleSelectUF(event: ChangeEvent<HTMLSelectElement>){
        const uf = event.target.value;
        setSelectedUF(uf);
    }
    
    function handleSelectCidade(event: ChangeEvent<HTMLSelectElement>){
        const cidade = event.target.value;
        setSelectedCidade(cidade);
    }

    function handleMapClick(event: LeafletMouseEvent){
        setSelectedPosition([
            event.latlng.lat,
            event.latlng.lng            
        ])
    }

    function handleInputChange(event: ChangeEvent<HTMLInputElement>){
        const { name, value } = event.target;
        setFormData({...formData, [name]:value});
    }

    function handleSelectItem(id: number){
        const alreadySelected = selectedItems.findIndex(item => item === id);

        if(alreadySelected >= 0){
            const filteredItems = selectedItems.filter(item => item !== id);
            setSelectedItems(filteredItems);
        }else{
            setSelectedItems([...selectedItems,id]);
        }
    }

    async function handleSubmit(event: FormEvent){
        event.preventDefault();
        const { name, email, whatsapp} = formData;
        const uf = selectedUf;
        const city = selectedCidade;
        const [latitude, longitude] = selectedPosition;
        const items = selectedItems;

        const data = new FormData();

         
        data.append('name',name);
        data.append('email',email);
        data.append('whatsapp',whatsapp);
        data.append('uf',uf);
        data.append('city',city);
        data.append('latitude',String(latitude));
        data.append('longitude',String(longitude));
        data.append('items',items.join(','));
        
        if(selectFile){
            data.append('image',selectFile);
        }
 
        await api.post('points', data);
        
        alert('Ponto de Coleta criado.');

        history.push('/');
    }

    return (
        <div id="page-create-point">
            <header>
                <img src={logo} alt="Ecoleta"/>
                <Link to="/">
                    <FiArrowLeft /> 
                    Voltar para home
                </Link>
            </header>
            <form onSubmit={handleSubmit}>
                <h1>Cadastro do <br /> ponto de coleta</h1>

                <Dropzone onFileUploaded={setSelectFile } />

                <fieldset>
                    <legend>
                        <h2>Dados</h2>
                    </legend>
                    <div className="field">
                        <label htmlFor="name">Nome da entidade</label>
                        <input 
                            type="text"
                            name="name"
                            id="name"
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="name">E-mail</label>
                            <input 
                                type="email"
                                name="email"
                                id="email"
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="field">
                            <label htmlFor="name">Whatsapp</label>
                            <input 
                                type="text"
                                name="whatsapp"
                                id="whatsapp"
                                onChange={handleInputChange}
                            />
                        </div>
                    </div>
                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Endereço</h2>
                        <span>Selecione o enderço no mapa</span>
                    </legend>
                    <Map center={initialPosition} zoom={15} onclick={handleMapClick}>
                    <TileLayer
                        attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <Marker position={selectedPosition}>
                            <Popup>
                                Titulo do <br /> ponto {selectedPosition}.
                            </Popup>
                        </Marker>
                    </Map>
                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="uf">Estado (UF)</label>
                            <select name="uf" id="uf" onChange={handleSelectUF} value={selectedUf}>
                                <option value="0">Selecione uma UF</option>
                                {ufs.map(uf=>(
                                    <option key={uf.id} value={uf.sigla}>{uf.sigla}</option>
                                ))}
                            </select>
                        </div>
                        <div className="field">
                            <label htmlFor="city">Cidade</label>
                            <select 
                                name="city" 
                                id="city"
                                value={selectedCidade}
                                onChange={handleSelectCidade}
                            >
                                <option value="0">Selecione uma cidade</option>
                                {cidades.map(cidade=>(
                                    <option key={cidade.id} value={cidade.nome}>{cidade.nome}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Ítems de coleta</h2>
                        <span>Selecione um ou mais ítems no mapa</span>
                    </legend>
                    <ul className="items-grid">
                        {items.map(item => (
                            <li 
                                key={item.id} 
                                onClick={() => handleSelectItem(item.id)}
                                className={selectedItems.includes(item.id)?'selected':''}
                            >
                                <img src={item.image_url} alt={item.title}/>
                                <span>{item.title}</span>
                            </li>
                        ))}
                    </ul>
                </fieldset>
                <button type="submit">
                    Cadastrar ponto de coleta
                </button>
            </form>
        </div>
    );
}

export default CreatePoint;