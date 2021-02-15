import React, { useState, useLayoutEffect } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { FiPower, FiTrash2, FiArrowDown, FiArrowUp } from 'react-icons/fi';
import Modal from 'react-modal';
import api from '../../services/api';
import './styles.css';

import logoImg from '../../assets/logo.svg';

export default function Profile() {
    const [income, setIncome] = useState({});
    const [essentialExpenses, setEssentialExpenses] = useState({});
    const [nonEssentialExpenses, setNonEssentialExpenses] = useState({});
    const [investments, setInvestments] = useState({});
    const [waste, setWaste] = useState({});
    const [remnant, setRemnant] = useState({});
    const [movements, setMovements] = useState([]);
    const [baseIncome, setBaseIncome] = useState({});
    const [baseEssentialExpenses, setBaseEssentialExpenses] = useState({});
    const [baseNonEssentialExpenses, setBaseNonEssentialExpenses] = useState({});
    const [baseInvestments, setBaseInvestments] = useState({});
    const [baseWaste, setBaseWaste] = useState({});
    const [baseRemnant, setBaseRemnant] = useState({});
    const [modalIsOpen,setIsOpen] = useState(false);
    const [modalText, setModalText] = useState('');
    const [modalNavigation, setModalNavigation] = useState('');

    const [nameFilter, setNameFilter] = useState('');
    const [valueFilter, setValueFilter] = useState('');
    const [cleanUpFilters, setCleanUpFilters] = useState(false);
    const history = useHistory();

    const userName = localStorage.getItem('userName');
    const userToken = localStorage.getItem('token');

    useLayoutEffect(() => {
        if(!userToken) {
            setModalText('A sessão expirou, por favor faça login novamente');
            setModalNavigation('/');
            openModal();
        } else {
            api.get('api/spending-division/', {
                headers: {
                'Authorization': `Basic ${userToken}` 
                }
            }).then(response => {
                setIncome(response.data.income);
                setEssentialExpenses(response.data.essentialExpenses);
                setNonEssentialExpenses(response.data.nonEssentialExpenses);
                setInvestments(response.data.investments);
                setWaste(response.data.waste);
                setRemnant(response.data.remnant);
                setMovements([
                    ...response.data.income.financial_movements, 
                    ...response.data.essentialExpenses.financial_movements, 
                    ...response.data.nonEssentialExpenses.financial_movements, 
                    ...response.data.investments.financial_movements, 
                    ...response.data.waste.financial_movements,
                ]);
            }).catch(error => {
                console.log()
                if (
                    error.response.data.code === 400 
                    && error.response.data.message === 'This User has no financial movements registered yet.'
                ) {
                    localStorage.setItem('classification', 'RECEITAS');
                    setModalText('Você ainda não possui nenhum movimento financeiro do tipo RECEITA cadastrado, por favor cadastre.');
                    setModalNavigation('/financial-movement/new');
                    openModal();
                } else {
                    localStorage.setItem('classification', 'RECEITAS');
                    setModalText('Não foi possível carregar dados do usuário, por favor tente novamente.');
                    setModalNavigation('/profile');
                    openModal();
                }
            })
            api.get('api/spending-division/base/', {
                headers: {
                'Authorization': `Basic ${userToken}` 
                }
            }).then(response => {
                setBaseIncome(response.data.income);
                setBaseEssentialExpenses(response.data.essentialExpenses);
                setBaseNonEssentialExpenses(response.data.nonEssentialExpenses);
                setBaseInvestments(response.data.investments);
                setBaseWaste(response.data.waste);
                setBaseRemnant(response.data.remnant);
            })
        }
    }, [history, userToken]);

    function transformDecimalInPercentage(decimalNumber) {
        if (decimalNumber === 0) return '0'; 
        if(decimalNumber){
            decimalNumber = decimalNumber + '';

            if (decimalNumber === '1') return '100';
            
            if (decimalNumber.split(".")[1].split('').length === 1) {
                return decimalNumber.split(".")[1] + 0
            }

            if (decimalNumber.split(".")[1].split('')[0] === '0') {
                return decimalNumber.split(".")[1].split('')[1];
            }

            return decimalNumber.split(".")[1];
        }
    }

    async function searchMovements(e) {
        e.preventDefault();
        try {
            let url = 'api/financial-movement?';
            if(cleanUpFilters) {
                await api.get(url, {
                    headers: {
                    'Authorization': `Basic ${userToken}` 
                    }
                }).then(response => {
                    setMovements([
                        ...response.data.data
                    ]);
                    setCleanUpFilters(false);
                    setNameFilter('');
                    setValueFilter('');
                })
            } else {
                if (nameFilter) url += '&name=' + nameFilter;
                if (valueFilter) url += '&value=' + valueFilter;

                await api.get(url, {
                    headers: {
                        'Authorization': `Basic ${userToken}` 
                    }
                }).then(response => {
                    setMovements([
                        ...response.data.data
                    ]);
                })
            }
        } catch (error) {
            setModalText('Erro ao filtrar movimentos, tente novamente.');
            setModalNavigation();
            openModal();
        }
    }

    async function sortFilter(sortParam, sortOrder) {
        try {
            let url = 'api/financial-movement?sortParam=' + sortParam + '&sortOrder='+sortOrder;

            await api.get(url, {
                headers: {
                    'Authorization': `Basic ${userToken}` 
                }
            }).then(response => {
                setMovements([
                    ...response.data.data
                ]);
            })
        } catch (error) {
        }
    }

    async function handleDeleteMovement(id) {
        try{
            await api.delete('api/financial-movement/' + id, {
                headers: {
                    'Authorization': `Basic ${userToken}` 
                }
            });
            setMovements(movements.filter(movement => movement.id !== id));
            api.get('api/spending-division/', {
                headers: {
                'Authorization': `Basic ${userToken}` 
                }
            }).then(response => {
                setIncome(response.data.income);
                setEssentialExpenses(response.data.essentialExpenses);
                setNonEssentialExpenses(response.data.nonEssentialExpenses);
                setInvestments(response.data.investments);
                setWaste(response.data.waste);
                setRemnant(response.data.remnant);
                setMovements([
                    ...response.data.income.financial_movements, 
                    ...response.data.essentialExpenses.financial_movements, 
                    ...response.data.nonEssentialExpenses.financial_movements, 
                    ...response.data.investments.financial_movements, 
                    ...response.data.waste.financial_movements,
                ]);
            }).catch(error => {
                if (
                    error.response.data.code === 400 
                    && error.response.data.message === 'This User has no financial movements registered yet.'
                ) {
                    localStorage.setItem('classification', 'RECEITAS');
                    setModalText('Você ainda não possui nenhum movimento financeiro do tipo RECEITA cadastrado, por favor cadastre.');
                    setModalNavigation('/financial-movement/new');
                    openModal();
                } else {
                    localStorage.setItem('classification', 'RECEITAS');
                    setModalText('Não foi possível carregar dados do usuário, por favor tente novamente.');
                    setModalNavigation('/profile');
                    openModal();
                }
            });
            api.get('api/spending-division/base/', {
                headers: {
                'Authorization': `Basic ${userToken}` 
                }
            }).then(response => {
                setBaseIncome(response.data.income);
                setBaseEssentialExpenses(response.data.essentialExpenses);
                setBaseNonEssentialExpenses(response.data.nonEssentialExpenses);
                setBaseInvestments(response.data.investments);
                setBaseWaste(response.data.waste);
                setBaseRemnant(response.data.remnant);
            });
        } catch (err) {
            setModalText('Erro ao deletar movimento, tente novamente.');
            setModalNavigation();
            openModal();
        }
    }

    function openModal() {
        setIsOpen(true);
    }

    function closeModal() {
        setIsOpen(false);
    }

    function handleLogout(){
        localStorage.clear();
        history.push('/');
    }

    return (
        <div className="profile-container">
            <header>
                <img src={logoImg} alt="Go To Million" />
                <span>Bem vindo(a), {userName}</span>

                <Link className="button" to="/financial-movement/new">Cadastrar novo movimento</Link>
                <button onClick={handleLogout} type="button">
                    <FiPower size={18} color="#006B3F" />
                </button>
            </header>
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
            <div className="spending-division">
                <h1>Divisão de gastos</h1>
                <ul>
                    <li>
                        <h2>Divisão de gastos atual</h2>
                        <ul>
                            <li>
                                <strong>Total de receitas:</strong>
                                <p>{Intl.NumberFormat('pt-BR', {style: 'currency', currency: 'BRL'}).format(income.inValue)} / {transformDecimalInPercentage(income.inPercentage)}%</p>

                                <strong>Total de Gastos essenciais:</strong>
                                <p>{Intl.NumberFormat('pt-BR', {style: 'currency', currency: 'BRL'}).format(essentialExpenses.inValue)} / {transformDecimalInPercentage(essentialExpenses.inPercentage)}%</p>

                                <strong>Total de Gastos Não essenciais:</strong>
                                <p>{Intl.NumberFormat('pt-BR', {style: 'currency', currency: 'BRL'}).format(nonEssentialExpenses.inValue)} / {transformDecimalInPercentage(nonEssentialExpenses.inPercentage)}%</p>
                            </li>
                            <li>
                                <strong>Total de Investimentos:</strong>
                                <p>{Intl.NumberFormat('pt-BR', {style: 'currency', currency: 'BRL'}).format(investments.inValue)} / {transformDecimalInPercentage(investments.inPercentage)}%</p>

                                <strong>Total de Gastos livres:</strong>
                                <p>{Intl.NumberFormat('pt-BR', {style: 'currency', currency: 'BRL'}).format(waste.inValue)} / {transformDecimalInPercentage(waste.inPercentage)}%</p>
                                
                                <strong>Restante</strong>
                                <p>{Intl.NumberFormat('pt-BR', {style: 'currency', currency: 'BRL'}).format(remnant.inValue)} / {transformDecimalInPercentage(remnant.inPercentage)}%</p>
                            </li>
                        </ul>
                    </li>
                    <li>
                        <h2>Divisão de gastos base</h2>
                        <ul>
                            <li>
                                <strong>Total de receitas:</strong>
                                <p>{Intl.NumberFormat('pt-BR', {style: 'currency', currency: 'BRL'}).format(baseIncome.inValue)} / {transformDecimalInPercentage(baseIncome.inPercentage)}%</p>

                                <strong>Total de Gastos essenciais:</strong>
                                <p>{Intl.NumberFormat('pt-BR', {style: 'currency', currency: 'BRL'}).format(baseEssentialExpenses.inValue)} / {transformDecimalInPercentage(baseEssentialExpenses.inPercentage)}%</p>

                                <strong>Total de Gastos Não essenciais:</strong>
                                <p>{Intl.NumberFormat('pt-BR', {style: 'currency', currency: 'BRL'}).format(baseNonEssentialExpenses.inValue)} / {transformDecimalInPercentage(baseNonEssentialExpenses.inPercentage)}%</p>
                            </li>
                            <li>
                                <strong>Total de Investimentos:</strong>
                                <p>{Intl.NumberFormat('pt-BR', {style: 'currency', currency: 'BRL'}).format(baseInvestments.inValue)} / {transformDecimalInPercentage(baseInvestments.inPercentage)}%</p>

                                <strong>Total de Gastos livres:</strong>
                                <p>{Intl.NumberFormat('pt-BR', {style: 'currency', currency: 'BRL'}).format(baseWaste.inValue)} / {transformDecimalInPercentage(baseWaste.inPercentage)}%</p>
                                
                                <strong>Restante</strong>
                                <p>{Intl.NumberFormat('pt-BR', {style: 'currency', currency: 'BRL'}).format(baseRemnant.inValue)} / {transformDecimalInPercentage(baseRemnant.inPercentage)}%</p>
                            </li>
                        </ul>
                    </li>
                </ul>
            </div>
            <div>
                <h1 id="title_finances_movements">Movimentos financeiros</h1>
                <h3>Filtros</h3>
                <form id="search-movements" onSubmit={searchMovements}>
                    <div className="input-block">
                        <label htmlFor={nameFilter}>Nome</label>
                        <input type="text" id={nameFilter} onChange={(e) => { setNameFilter(e.target.value)}} />
                    </div>
                    <div className="input-block">
                        <label htmlFor={valueFilter}>Valor</label>
                        <input type="text" id={valueFilter} onChange={(e) => { setValueFilter(e.target.value)}} />
                    </div>
                    <div className="search_buttons">
                        <button id="button_filters" type="submit" className="button">
                            Filtrar
                        </button>
                        <button id="cleanup_filters" type="submit" onClick={() => setCleanUpFilters(true)} className="button">
                            Limpar
                        </button>
                    </div>
                </form>
            </div>
            <div className="movements">
                <table>
                    <thead>
                        <tr>
                            <th>
                                NOME
                                <button onClick={() => sortFilter('name', 'desc')} type="button">
                                    <FiArrowDown size={16} color="#006B3F"/>
                                </button>
                                <button onClick={() => sortFilter('name', 'asc')} type="button">
                                    <FiArrowUp size={16} color="#006B3F"/>
                                </button>
                            </th>
                            <th>
                                CLASSIFICAÇÃO
                                <button onClick={() => sortFilter('classification', 'desc')} type="button">
                                    <FiArrowDown size={16} color="#006B3F"/>
                                </button>
                                <button onClick={() => sortFilter('classification', 'asc')} type="button">
                                    <FiArrowUp size={16} color="#006B3F"/>
                                </button>
                            </th>
                            <th>
                                VALOR
                                <button onClick={() => sortFilter('value', 'desc')} type="button">
                                    <FiArrowDown size={16} color="#006B3F"/>
                                </button>
                                <button onClick={() => sortFilter('value', 'asc')} type="button">
                                    <FiArrowUp size={16} color="#006B3F"/>
                                </button>
                            </th>
                            <th></th>
                        </tr>
                    </thead>

                    <tbody>
                        {movements.map(movement => (
                            <tr key={movement.id}>
                                <td className="name">{movement.name}</td>
                                <td className="classification">{movement.classification}</td>
                                <td>{Intl.NumberFormat('pt-BR', {style: 'currency', currency: 'BRL'}).format(movement.value)}</td>
                                <td>
                                    {/* <button onClick={() => handleDeleteMovement(movement.id)} type="button">
                                        <FiEdit2 size={20} color="#a8a8b3" />
                                    </button> */}
                                    <button onClick={() => handleDeleteMovement(movement.id)} type="button">
                                        <FiTrash2 size={20} color="#a8a8b3" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}