import React, { useState, useEffect } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { FiPower, FiTrash2 } from 'react-icons/fi';

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

    const [classificationFilter, setClassificationFilter] = useState('');
    const [nameFilter, setNameFilter] = useState('');
    const [orderFilter, setOrderFilter] = useState('');
    const [cleanUpFilters, setCleanUpFilters] = useState(false);
    const history = useHistory();

    const userId = localStorage.getItem('userId');
    const userName = localStorage.getItem('userName');

    useEffect(() => {
            api.get('api/spending-division/' + userId).then(response => {
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
                console.log(error);
                if(!userId) {
                    alert('A sessão expirou, por favor faça login novamente');
                    history.push('/');
                }
                alert('Esse usuário não possui movimento financeiro do tipo receita ainda, favor cadastrar');
                history.push('/financial-movement/new');
            })
            api.get('api/spending-division/base/' + userId).then(response => {
                setBaseIncome(response.data.income);
                setBaseEssentialExpenses(response.data.essentialExpenses);
                setBaseNonEssentialExpenses(response.data.nonEssentialExpenses);
                setBaseInvestments(response.data.investments);
                setBaseWaste(response.data.waste);
                setBaseRemnant(response.data.remnant);
            })
    }, [history, userId]);

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

    async function searchMovements(e, cleanFilter = false) {
        e.preventDefault();
        try {
            let url = 'api/financial-movement?user_id=' + userId;
            if(cleanUpFilters) {
                await api.get(url).then(response => {
                    setMovements([
                        ...response.data.data
                    ]);
                })
                setCleanUpFilters(false);
                setClassificationFilter('');
                setNameFilter('');
                setOrderFilter('');
            } else {
                if (classificationFilter) url += '&classification=' + classificationFilter;
                if (nameFilter) url += '&name=' + nameFilter;
                if (orderFilter){
                    url += '&sortParam=' + orderFilter.split('/')[0];
                    url += '&sortOrder=' + orderFilter.split('/')[1];
                } 

                await api.get(url).then(response => {
                    console.log(response.data.data)
                    setMovements([
                        ...response.data.data
                    ]);
                })
            }
        } catch (error) {
            console.log(error);
            alert('Erro ao filtrar movimentos, tente novamente.');
        }
    }

    async function handleDeleteMovement(id) {
        try{
            await api.delete('api/financial-movement/' + id);
            setMovements(movements.filter(movement => movement.id !== id));
            api.get('api/spending-division/' + userId).then(response => {
                setIncome(response.data.income);
                setEssentialExpenses(response.data.essentialExpenses);
                setNonEssentialExpenses(response.data.nonEssentialExpenses);
                setInvestments(response.data.investments);
                setWaste(response.data.waste);
                setMovements([
                    ...response.data.income.financial_movements, 
                    ...response.data.essentialExpenses.financial_movements, 
                    ...response.data.nonEssentialExpenses.financial_movements, 
                    ...response.data.investments.financial_movements, 
                    ...response.data.waste.financial_movements,
                ]);
            })
        } catch (err) {
            console.log(err);
            alert('Erro ao deletar caso, tente novamente.');
        }
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
            <div className="spending-division">
                <h1>Divisão de gastos e movimentos financeiros</h1>
                <ul>
                    <li>
                        <h2>Divisão de gastos atual</h2>
                        <ul>
                            <li>
                                <strong>Total de receitas:</strong>
                                <p>R$ {income.inValue} / {transformDecimalInPercentage(income.inPercentage)}%</p>

                                <strong>Total de Gastos essenciais:</strong>
                                <p>R$ {essentialExpenses.inValue} / {transformDecimalInPercentage(essentialExpenses.inPercentage)}%</p>

                                <strong>Total de Gastos Não essenciais:</strong>
                                <p>R$ {nonEssentialExpenses.inValue} / {transformDecimalInPercentage(nonEssentialExpenses.inPercentage)}%</p>
                            </li>
                            <li>
                                <strong>Total de Investimentos:</strong>
                                <p>R$ {investments.inValue} / {transformDecimalInPercentage(investments.inPercentage)}%</p>

                                <strong>Total de Gastos livres:</strong>
                                <p>R$ {waste.inValue} / {transformDecimalInPercentage(waste.inPercentage)}%</p>
                                
                                <strong>Restante</strong>
                                <p>R$ {remnant.inValue} / {transformDecimalInPercentage(remnant.inPercentage)}%</p>
                            </li>
                        </ul>
                    </li>
                    <li>
                        <h2>Divisão de gastos base</h2>
                        <ul>
                            <li>
                                <strong>Total de receitas:</strong>
                                <p>R$ {baseIncome.inValue} / {transformDecimalInPercentage(baseIncome.inPercentage)}%</p>

                                <strong>Total de Gastos essenciais:</strong>
                                <p>R$ {baseEssentialExpenses.inValue} / {transformDecimalInPercentage(baseEssentialExpenses.inPercentage)}%</p>

                                <strong>Total de Gastos Não essenciais:</strong>
                                <p>R$ {baseNonEssentialExpenses.inValue} / {transformDecimalInPercentage(baseNonEssentialExpenses.inPercentage)}%</p>
                            </li>
                            <li>
                                <strong>Total de Investimentos:</strong>
                                <p>R$ {baseInvestments.inValue} / {transformDecimalInPercentage(baseInvestments.inPercentage)}%</p>

                                <strong>Total de Gastos livres:</strong>
                                <p>R$ {baseWaste.inValue} / {transformDecimalInPercentage(baseWaste.inPercentage)}%</p>
                                
                                <strong>Restante</strong>
                                <p>R$ {baseRemnant.inValue} / {transformDecimalInPercentage(baseRemnant.inPercentage)}%</p>
                            </li>
                        </ul>
                    </li>
                </ul>
            </div>
            <div>
                <form id="search-movements" onSubmit={searchMovements}>
                    <div className="select-block">
                        <label htmlFor={orderFilter}>Ordenar por</label>
                        <select id={orderFilter} name="orderFilter" value={orderFilter} onChange={(e) => { setOrderFilter(e.target.value)}}>
                            <option value="" disabled hidden>Selecione uma opção</option>
                            {[
                                { value: 'classification/asc', label: 'Classificação ordem crescente' },
                                { value: 'classification/desc', label: 'Classificação ordem decrescente' },
                                { value: 'name/asc', label: 'Nome ordem crescente' },
                                { value: 'name/desc', label: 'Nome ordem decrescente' },
                                { value: 'value/asc', label: 'Valor ordem crescente' },
                                { value: 'value/desc', label: 'Valor ordem decrescente' },
                            ].map(option => {
                                return <option key={option.value} value={option.value}>{option.label}</option>
                            })}
                        </select>
                    </div>
                    <div className="select-block">
                        <label htmlFor={classificationFilter}>Classificação</label>
                        <select id={classificationFilter} name="classificationFilter" value={classificationFilter} onChange={(e) => { setClassificationFilter(e.target.value)}}>
                            <option value="" disabled hidden>Selecione uma opção</option>
                            {[
                                { value: 'receita', label: 'Receita' },
                                { value: 'gastos essenciais', label: 'Gastos essenciais' },
                                { value: 'gastos não essenciais', label: 'Gastos não essenciais' },
                                { value: 'investimentos', label: 'Investimentos' },
                                { value: 'torrar', label: 'Torrar' },
                            ].map(option => {
                                return <option key={option.value} value={option.value}>{option.label}</option>
                            })}
                        </select>
                    </div>
                    <div className="input-block">
                        <label htmlFor={nameFilter}>Nome</label>
                        <input type="text" id={nameFilter} onChange={(e) => { setNameFilter(e.target.value)}} />
                    </div>

                    <button type="submit" className="button">
                        Buscar
                    </button>
                    <button id="cleanup_filters" type="submit" onClick={() => setCleanUpFilters(true)} className="button">
                        Limpar filtros
                    </button>
                </form>
            </div>
            <div className="movements">
                <ul>
                    {movements.map(movement => (
                        <li key={movement.id}>
                            <strong>NOME:</strong>
                            <p>{movement.name}</p>

                            <strong>CLASSIFICAÇÃO:</strong>
                            <p>{movement.classification}</p>

                            <strong>VALOR:</strong>
                            <p>{Intl.NumberFormat('pt-BR', {style: 'currency', currency: 'BRL'}).format(movement.value)}</p>
                            
                            <button onClick={() => handleDeleteMovement(movement.id)} type="button">
                                <FiTrash2 size={20} color="#a8a8b3" />
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}