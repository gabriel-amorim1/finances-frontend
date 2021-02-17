import React, { useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import Modal from 'react-modal';
import Button from 'react-bootstrap-button-loader';

import api from '../../services/api';
import './styles.css'

import logoImg from '../../assets/logo.svg';

export default function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [modalIsOpen,setIsOpen] = useState(false);
    const [modalText, setModalText] = useState('');
    const [modalNavigation, setModalNavigation] = useState('');
    const [loading, setLoading] = useState(false);
    
    const history = useHistory();

    function openModal() {
        setIsOpen(true);
    }

    function closeModal() {
        setIsOpen(false);
    }

    async function handleRegister(e){
        e.preventDefault();
        setLoading(true);
        if (name && email && password && confirmPassword) {
            if (password === confirmPassword) {
                if(password.length >= 6) {
                    const data = {
                        name,
                        email,
                        password,
                    };
                    try {
                        const userCreated = await api.post('/api/user', data);
    
                        if (userCreated) {
                            const response = await api.post('api/sessions/', {
                                email,
                                password,
                            });

                            localStorage.setItem('userName', response.data.user.name);
                            localStorage.setItem('token', response.data.token);
                            
                            setLoading(false);
                            
                            history.push('/profile');
                        }
                    } catch (error) {
                        if (
                            error.response.data.code === 400
                            && error.response.data.message === 'Email already registered.'
                        ) {
                            setModalText('Email já cadastrado');
                            setModalNavigation();
                            openModal();
                        } else if (error.response.data.code === 400) {
                            setModalText('Por favor insira um email válido');
                            setModalNavigation();
                            openModal();
                        } else {
                            setModalText('Erro no cadastro, tente novamente');
                            setModalNavigation();
                            openModal();
                        }
                    }
                } else {
                    setModalText('A senha deve conter 6 ou mais caracteres');
                    setModalNavigation();
                    openModal();
                }
            } else {
                setModalText('As senhas não coincidem, tente novamente');
                setModalNavigation();
                openModal();
            }
        } else {
            setModalText('Por favor preencha todos os campos');
            setModalNavigation();
            openModal();
        }
        setLoading(false);
    }

    return (
        <div className="register-container">
            <Modal
                isOpen={modalIsOpen}
                id="modal"
            >
                <img src={logoImg} alt="Go To Million" />
                <span>{modalText}</span>
                <Link to={modalNavigation}>
                    <button onClick={closeModal}>Ok</button>
                </Link>
            </Modal>
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
                    <label className="form-label" htmlFor={name}>Nome</label>
                    <input 
                        placeholder="Ex.: João da Silva" 
                        value={name}
                        onChange={e => setName(e.target.value)}
                    />
                    <label className="form-label" htmlFor={email}>E-mail</label>
                    <input 
                        placeholder="Ex.: usuario@mail.com" 
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                    />
                    <label className="form-label" htmlFor={password}>Senha</label>
                    <input 
                        placeholder="Senha"
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                    />
                    <label className="form-label" htmlFor={confirmPassword}>Confirmação da senha</label>
                    <input 
                        placeholder="Confirme sua senha"
                        type="password"
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                    />
                    <Button className="button" type="submit" loading={loading}>Cadastrar</Button>
                </form>
            </div>
        </div>
    );
}