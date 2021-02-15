import React, { useState, useLayoutEffect } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';

import Modal from 'react-modal';

import api from '../../services/api';
import './styles.css';

import logoImg from '../../assets/logo.svg';

export default function NewMovement() {
    const [name, setName] = useState('');
    const [classification, setClassification] = useState('');
    const [value, setValue] = useState('');
    const [modalIsOpen,setIsOpen] = useState(false);
    const [modalText, setModalText] = useState('');
    const [modalNavigation, setModalNavigation] = useState('');

    const history = useHistory();

    const userToken = localStorage.getItem('token');
    const firstMovement = localStorage.getItem('classification');

    useLayoutEffect(() => {
        if(!userToken) {
            setModalText('Sua sessão expirou, por favor faça login novamente!');
            openModal();
            setModalNavigation('/');
        }
        if (firstMovement) setClassification(firstMovement);
    }, [history, userToken, firstMovement]);

    function openModal() {
        setIsOpen(true);
    }

    function closeModal() {
        setIsOpen(false);
    }

    async function handleNewMovement(e) {
        e.preventDefault();

        const data = {
            name,
            classification,
            value,
        };

        if (!name || !classification || !value) {
            setModalText('Por favor preencha todos os campos!');
            setModalNavigation();
            openModal();
        } else {
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
                localStorage.setItem('classification', '');
                history.push('/profile');
            } catch (err) {
                setModalText('Erro ao cadastrar movimento, tente novamente.');
                setModalNavigation();
                openModal();
            }
        }
    }

    return (
        <div className="new-movement-container">
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
                    
                    <h1>Cadastrar Novo Movimento Financeiro</h1>
                    <p>Cadastre um tipo de movimento financeiro pela classificação.</p>
                    
                    <Link className="back-link" to="/profile">
                        <FiArrowLeft size={16} color="#006B3F"/>
                        Voltar para home
                    </Link>
                </section>
                <form onSubmit={handleNewMovement}>
                    <label className="form-label" htmlFor={name}>Nome</label>
                    <input 
                        placeholder="Ex.: Salário"
                        value={name}
                        onChange={e => setName(e.target.value)}
                     />
                     <label className="form-label" htmlFor={classification}>Classificação</label>
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
                    <label className="form-label" htmlFor={value}>Valor</label>
                    <input 
                        placeholder="Ex.: 1100"
                        value={value}
                        onChange={e => setValue(e.target.value)}
                     />
                    <button className="button" type="submit">Cadastrar</button>
                </form>
            </div>
        </div>
    );
}