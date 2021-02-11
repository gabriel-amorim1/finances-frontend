import React, { useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { FiLogIn } from 'react-icons/fi';

import api from '../../services/api';
import './styles.css';

import logoImg from '../../assets/logo.svg';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const history = useHistory();

    async function handleLogin(e){
        e.preventDefault();
        try{
            const data = {
                email,
                password,
            };

            const response = await api.post('api/sessions/', data);

            localStorage.setItem('userName', response.data.user.name);
            localStorage.setItem('token', response.data.token);

            history.push('/profile');
        }catch(err){
            if (
                err.response.data.code === 404 
                && err.response.data.message === 'Email not found'
            ) {
                alert('Endereço de email não cadastrado');
            } else if (
                err.response.data.code === 401
                && err.response.data.message === 'Password does no match'
            ) {
                alert('Senha incorreta');
            } else if (
                err.response.data.code === 400
            ) {
                alert('Por favor insira um email válido');
            } else {
                alert('Falha no login, tente novamente');
            }
        }
    }

    return(
        <div className="login-container">
            <section className="form">
                <img src={logoImg} alt="Go To Million" />
                <form onSubmit={handleLogin}>
                    <h1>Faça seu login</h1>
                    <input 
                        placeholder="Seu Email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                     />
                     <input 
                        placeholder="Sua Senha"
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
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
                <p>- Como montar seu fundo de emergência</p>
                <p>- Como calcular o valor necessário para Aposentadoria</p>
                <p>- Checklist para decisões de alto impacto financeiro</p>
            </section>
        </div>
    );
}