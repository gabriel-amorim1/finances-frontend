import React, { useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { FiLogIn } from 'react-icons/fi';
import Modal from 'react-modal';
import Button from 'react-bootstrap-button-loader';

import api from '../../services/api';
import './styles.css';

import logoImg from '../../assets/logo.svg';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const history = useHistory();
    const [modalIsOpen,setIsOpen] = useState(false);
    const [modalText, setModalText] = useState('');
    const [modalNavigation, setModalNavigation] = useState('');
    const [loading, setLoading] = useState(false);

    function openModal() {
        setIsOpen(true);
    }

    function closeModal() {
        setIsOpen(false);
    }
    
    async function handleLogin(e){
        e.preventDefault();
        setLoading(true);
        try{
            const data = {
                email,
                password,
            };
            
            const response = await api.post('api/sessions/', data);
            
            localStorage.setItem('userName', response.data.user.name);
            localStorage.setItem('token', response.data.token);

            setLoading(false);

            history.push('/profile');
        }catch(err){
            if (
                err.response.data.code === 404 
                && err.response.data.message === 'Email not found'
            ) {
                setModalText('Endereço de email não cadastrado');
                setModalNavigation();
                openModal();
            } else if (
                err.response.data.code === 401
                && err.response.data.message === 'Password does no match'
            ) {
                setModalText('Senha incorreta');
                setModalNavigation();
                openModal();
            } else if (
                err.response.data.code === 400
            ) {
                setModalText('Email inválido');
                setModalNavigation();
                openModal();
            } else {
                setModalText('Falha no login, tente novamente');
                setModalNavigation();
                openModal();
            }
        }
        setLoading(false);
    }

    return(
        <div className="login-container">
            <Modal
                isOpen={modalIsOpen}
                id="modal-to-alert"
            >
                <img src={logoImg} alt="Go To Million" />
                <span>{modalText}</span>
                <Link to={modalNavigation}>
                    <button onClick={closeModal}>Ok</button>
                </Link>
            </Modal>
            <section className="form">
                <img src={logoImg} alt="Go To Million" />
                <form onSubmit={handleLogin}>
                    <h1>Faça seu login</h1>
                    <label className="form-label" htmlFor={email}>Email</label>
                    <input 
                        placeholder="Ex.: usuario@mail.com"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                    />
                    <label className="form-label" htmlFor={password}>Senha</label>
                    <input
                        placeholder="Insira sua senha"
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                    />
                    <Button className="button" type="submit" loading={loading}>Entrar</Button>
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