import React, { useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { FiLogIn } from 'react-icons/fi';

import api from '../../services/api';
import './styles.css';

import logoImg from '../../assets/logo.svg';

export default function Login() {
    const [id, setId] = useState('');
    const history = useHistory();

    async function handleLogin(e){
        e.preventDefault();
        try{
            const response = await api.get('api/user/' + id);

            localStorage.setItem('userId', id);
            localStorage.setItem('userName', response.data.name);

            history.push('/profile');
        }catch(err){
            alert('Falha no login, tente novamente');
        }
    }

    return(
        <div className="login-container">
            <section className="form">
                <img src={logoImg} alt="Go To Million" />
                <form onSubmit={handleLogin}>
                    <h1>Faça seu login</h1>
                    <input 
                        placeholder="Seu Id"
                        value={id}
                        onChange={e => setId(e.target.value)}
                     />
                    <button className="button" type="submit">Entrar</button>

                    <Link className="back-link" to="/register">
                        <FiLogIn size={16} color="#006B3F"/>
                        Não tenho cadastro
                    </Link>
                </form>
            </section>
            <section className="description">
                <h1>O que vamos encontrar aqui?</h1>
                <p>- Planilha Básica de orçamento</p>
                <p>- Divisão Básica de Gastos</p>
                <p>- Fundo de emergência</p>
                <p>- Aposentadoria</p>
                <p>- Checklist para decisões de alto impacto financeiro</p>
            </section>
        </div>
    );
}