import React, { useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';

import api from '../../services/api';
import './styles.css'

import logoImg from '../../assets/logo.svg';

export default function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    
    const history = useHistory();

    async function handleRegister(e){
        e.preventDefault();

        if (password === confirmPassword) {
            if(password.length >= 6) {
                const data = {
                    name,
                    email,
                    password,
                };
                
                try{
                    await api.post('/api/user', data);
                    const response = await api.post('api/sessions/', {
                        email,
                        password,
                    });
    
                    localStorage.setItem('userName', response.data.user.name);
                    localStorage.setItem('token', response.data.token);
    
                    history.push('/profile');
                }catch(err){
                    console.log(err);
                    alert('Erro no cadastro, tente novamente');
                }
            } else {
                alert('A senha deve conter 6 ou mais caracteres');
            }
        } else {
            alert('As senhas não coincidem, tente novamente');
        }
        
    }

    return (
        <div className="register-container">
            <div className="content">
                <section>
                    <img src={logoImg} alt="Go To Million" />
                    
                    <h1>Cadastro</h1>
                    <p>Faça seu cadastro, entre na plataforma e aprenda a gerênciar seu dinheiro.</p>
                    
                    <Link className="back-link" to="/">
                        <FiArrowLeft size={16} color="#006B3F"/>
                        Voltar para o login
                    </Link>
                </section>
                <form onSubmit={handleRegister}>
                    <input 
                        placeholder="Nome" 
                        value={name}
                        onChange={e => setName(e.target.value)}
                    />
                    <input 
                        placeholder="E-mail" 
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                    />
                    <input 
                        placeholder="Senha"
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                    />

                    <div className="input-group">
                        <input 
                            placeholder="Confirme sua senha"
                            type="password"
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                        />
                    </div>

                    <button className="button" type="submit">Cadastrar</button>
                </form>
            </div>
        </div>
    );
}