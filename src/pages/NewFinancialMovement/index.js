import React, { useState, useLayoutEffect } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';

import api from '../../services/api';
import './styles.css';

import logoImg from '../../assets/logo.svg';

export default function NewMovement() {
    const [name, setName] = useState('');
    const [classification, setClassification] = useState('');
    const [value, setValue] = useState('');

    const history = useHistory();

    const userToken = localStorage.getItem('token');

    useLayoutEffect(() => {
        if(!userToken) {
            alert('A sessão expirou, por favor faça login novamente');
            history.push('/');
        }
    }, [history, userToken]);

    async function handleNewMovement(e) {
        e.preventDefault();

        const data = {
            name,
            classification,
            value,
        };

        try{
            await api.post(
                'api/financial-movement', 
                data, 
                {
                    headers: {
                    'Authorization': `Basic ${userToken}` 
                    }
                }
            );
            history.push('/profile');
        } catch (err) {
            alert('Erro ao cadastrar movimento, tente novamente. ');
        }
    }

    return (
        <div className="new-movement-container">
            <div className="content">
                <section>
                    <img src={logoImg} alt="Go To Million" />
                    
                    <h1>Cadastrar Novo Movimento Financeiro</h1>
                    <p>Cadastre um tipo de movimento financeiro pela classificação.</p>
                    
                    <Link className="back-link" to="/profile">
                        <FiArrowLeft size={16} color="#006B3F"/>
                        Voltar para home
                    </Link>
                </section>
                <form onSubmit={handleNewMovement}>
                    <input 
                        placeholder="Nome do movimento financeiro"
                        value={name}
                        onChange={e => setName(e.target.value)}
                     />
                     <select id={classification} name="classification" value={classification} onChange={(e) => { setClassification(e.target.value)}}>
                        <option value="" disabled hidden>Escolha a classificação do movimento</option>
                        {[
                            { value: 'RECEITAS', label: 'Receita' },
                            { value: 'GASTOS ESSENCIAIS', label: 'Gastos essenciais' },
                            { value: 'GASTOS NAO ESSENCIAIS', label: 'Gastos não essenciais' },
                            { value: 'INVESTIMENTOS', label: 'Investimentos' },
                            { value: 'GASTOS LIVRES', label: 'Gastos livres' },
                        ].map(option => {
                            return <option key={option.value} value={option.value}>{option.label}</option>
                        })}
                    </select>
                    <input 
                        placeholder="Valor em reais"
                        value={value}
                        onChange={e => setValue(e.target.value)}
                     />
                    <button className="button" type="submit">Cadastrar</button>
                </form>
            </div>
        </div>
    );
}