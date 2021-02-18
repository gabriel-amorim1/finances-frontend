import React, { useState, useLayoutEffect } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { FiPower, FiTrash2, FiArrowDown, FiArrowUp, FiEdit2, FiInfo } from 'react-icons/fi';
import Modal from 'react-modal';
import ReactTooltip from 'react-tooltip';
import Button from 'react-bootstrap-button-loader';

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
    const [baseEssentialExpensesToEdit, setBaseEssentialExpensesToEdit] = useState({});
    const [baseNonEssentialExpensesToEdit, setBaseNonEssentialExpensesToEdit] = useState({});
    const [baseInvestmentsToEdit, setBaseInvestmentsToEdit] = useState({});
    const [baseWasteToEdit, setBaseWasteToEdit] = useState({});
    const [modalIsOpen,setIsOpen] = useState(false);
    const [modalToConfirmIsOpen,setToConfirmIsOpen] = useState(false);
    const [modalToEditIsOpen,setToEditIsOpen] = useState(false);
    const [modalToEditBaseSpendingDivisionIsOpen, setToEditBaseSpendingDivisionIsOpen] = useState(false);
    const [modalText, setModalText] = useState('');
    const [modalNavigation, setModalNavigation] = useState('');
    const [movementIdToRemove, setMovementIdToRemove] = useState('');
    const [movementIdToEdit, setMovementIdToEdit] = useState('');
    const [loading, setLoading] = useState(false);
    const [nameToEdit, setNameToEdit] = useState('');
    const [classificationToEdit, setClassificationToEdit] = useState('');
    const [valueToEdit, setValueToEdit] = useState('');

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
                    && (error.response.data.message === 'This User has no financial movements registered yet.'
                    || 'This User has no financial movements as "RECEITAS" registered yet.')
                ) {
                    localStorage.setItem('classification', 'RECEITAS');
                    setModalText('Você ainda não possui nenhum movimento financeiro do tipo RECEITA cadastrado, por favor cadastre.');
                    setModalNavigation('/financial-movement/new');
                    openModal();
                } else {
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
                setNameFilter('');
                setValueFilter('');
                await api.get(url, {
                    headers: {
                    'Authorization': `Basic ${userToken}` 
                    }
                }).then(response => {
                    setMovements([
                        ...response.data.data
                    ]);
                    setCleanUpFilters(false);
                })
            } else {
                if (nameFilter) url += '&name=' + nameFilter;
                if (valueFilter) url += '&value=' + valueFilter.replace(',', '.');

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

    async function handleEditMovement() {
        setLoading(true);
        console.log("chegou")

        if (!movementIdToEdit || !nameToEdit || !classificationToEdit || !valueToEdit) {
            setModalText('Por favor preencha todos os campos!');
            setModalNavigation();
            openModal();
        } else {
            console.log(valueToEdit)
            const data = {
                name: nameToEdit,
                classification: classificationToEdit,
                value: valueToEdit.toString().replace(',', '.'),
            };
            try{
                await api.put(
                    'api/financial-movement/' + movementIdToEdit, 
                    data, 
                    {
                        headers: {
                        'Authorization': `Basic ${userToken}` 
                        }
                    }
                );
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
                    setMovementIdToRemove('');
                    if (
                        error.response.data.code === 400 
                        && (error.response.data.message === 'This User has no financial movements registered yet.'
                        || 'This User has no financial movements as "RECEITAS" registered yet.')
                    ) {
                        localStorage.setItem('classification', 'RECEITAS');
                        setModalText('Você ainda não possui nenhum movimento financeiro do tipo RECEITA cadastrado, por favor cadastre.');
                        setModalNavigation('/financial-movement/new');
                        openModal();
                    } else {
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

                setLoading(false);

                history.push('/profile');
            } catch (err) {
                setModalText('Erro ao editar movimento, tente novamente.');
                setModalNavigation();
                openModal();
            }
            setLoading(false);
            setToEditIsOpen(false);
        }
    }

    async function handleDeleteMovement() {
        setToConfirmIsOpen(false);
        try{
            await api.delete('api/financial-movement/' + movementIdToRemove, {
                headers: {
                    'Authorization': `Basic ${userToken}` 
                }
            });
            setMovements(movements.filter(movement => movement.id !== movementIdToRemove));
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
                setMovementIdToRemove('');
                if (
                    error.response.data.code === 400 
                    && (error.response.data.message === 'This User has no financial movements registered yet.'
                    || 'This User has no financial movements as "RECEITAS" registered yet.')
                ) {
                    localStorage.setItem('classification', 'RECEITAS');
                    setModalText('Você ainda não possui nenhum movimento financeiro do tipo RECEITA cadastrado, por favor cadastre.');
                    setModalNavigation('/financial-movement/new');
                    openModal();
                } else {
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
        setMovementIdToRemove('');
    }

    async function handleEditBaseSpendingDivision() {
        setToEditBaseSpendingDivisionIsOpen(false);
        try{
            const data = {
                essential_expenses: baseEssentialExpensesToEdit/100,
                non_essential_expenses: baseNonEssentialExpensesToEdit/100,
                wastes: baseWasteToEdit/100,
                investments: baseInvestmentsToEdit/100,
            };
            console.log(data);
            await api.put('api/spending-division/base/', data, {
                headers: {
                    'Authorization': `Basic ${userToken}` 
                }
            });
            await api.get('api/spending-division/base/', {
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
            setModalText('Erro ao editar divisão de gastos base, tente novamente.');
            setModalNavigation();
            openModal();
        }
    }

    function openModal() {
        setIsOpen(true);
    }

    function openModalToConfirm(id) {
        setMovementIdToRemove(id);
        setModalText('Tem certeza que deseja excluir esse movimento?');
        setToConfirmIsOpen(true);
    }

    function openModalToEdit(movement) {
        setMovementIdToEdit(movement.id);
        setNameToEdit(movement.name);
        setClassificationToEdit(movement.classification);
        setValueToEdit(movement.value);
        setModalText('Editar movimento financeiro');
        setToEditIsOpen(true);
    }

    function openModalToEditBaseSpendingDivision() {
        setBaseEssentialExpensesToEdit(transformDecimalInPercentage(baseEssentialExpenses.inPercentage));
        setBaseNonEssentialExpensesToEdit(transformDecimalInPercentage(baseNonEssentialExpenses.inPercentage));
        setBaseWasteToEdit(transformDecimalInPercentage(baseWaste.inPercentage));
        setBaseInvestmentsToEdit(transformDecimalInPercentage(baseInvestments.inPercentage));
        setModalText('Editar divisão de gastos base');
        setToEditBaseSpendingDivisionIsOpen(true);
    }

    function closeModal() {
        setMovementIdToRemove('');
        setIsOpen(false);
        setToConfirmIsOpen(false);
        setToEditIsOpen(false);
        setToEditBaseSpendingDivisionIsOpen(false);
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
                <button onClick={handleLogout} type="button" alt="Botão de logout" data-tip="Fazer logout">
                    <ReactTooltip place="bottom"/>
                    <FiPower size={18} color="#006B3F"/>
                </button>
            </header>
            <Modal
                isOpen={modalIsOpen}
                id="modal-to-alert"
                ariaHideApp={false}
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
                        <Modal
                            isOpen={modalToEditBaseSpendingDivisionIsOpen}
                            id="modal-to-edit-base-spending-division"
                            ariaHideApp={false}
                        >
                            <img src={logoImg} alt="Go To Million" />
                            <span>{modalText}</span>
                            <form>
                                <label className="form-label" htmlFor={baseEssentialExpensesToEdit}>Porcentagem base de GASTOS ESSENCIAIS</label>
                                <input 
                                    value={baseEssentialExpensesToEdit}
                                    onChange={e => setBaseEssentialExpensesToEdit(e.target.value)}
                                />
                                <label className="form-label" htmlFor={baseNonEssentialExpensesToEdit}>Porcentagem base de GASTOS NÃO ESSENCIAIS</label>
                                <input 
                                    value={baseNonEssentialExpensesToEdit}
                                    onChange={e => setBaseNonEssentialExpensesToEdit(e.target.value)}
                                />
                                <label className="form-label" htmlFor={baseWasteToEdit}>Porcentagem base de GASTOS LIVRES</label>
                                <input 
                                    value={baseWasteToEdit}
                                    onChange={e => setBaseWasteToEdit(e.target.value)}
                                />
                                <label className="form-label" htmlFor={baseInvestmentsToEdit}>Porcentagem base de INVESTIMENTOS</label>
                                <input 
                                    value={baseInvestmentsToEdit}
                                    onChange={e => setBaseInvestmentsToEdit(e.target.value)}
                                />
                            </form>
                            <div>
                                <button className="cancel-modal-button" onClick={() => closeModal()}>Cancelar</button>
                                <Button className="button" onClick={() => handleEditBaseSpendingDivision()} loading={loading}>Editar</Button>
                            </div>
                        </Modal>
                        <div className="spending-division-base-title-row">
                            <div className="spending-division-base-title">
                                <h2>Divisão de gastos base</h2>
                                <FiInfo size={20} color="#a8a8b3" alt="Informação sobre Divisão de gastos base" data-tip="A divisão de gastos base mostra como você deveria dividir suas receitas. É como se fosse uma meta a ser seguida, você pode editá-la deixando-a de acordo com suas necessidades."/>
                            </div>
                            <button onClick={() => openModalToEditBaseSpendingDivision()} type="button">
                                <FiEdit2 size={20} color="#000000" alt="Botão para editar Divisão de gastos base" data-tip="Editar Divisão de gastos base"/>
                                <ReactTooltip place="bottom"/>
                            </button>
                        </div>
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
                        <input type="text" value={nameFilter} onChange={(e) => { setNameFilter(e.target.value)}} />
                    </div>
                    <div className="input-block">
                        <label htmlFor={valueFilter}>Valor</label>
                        <input type="text" value={valueFilter} onChange={(e) => { setValueFilter(e.target.value)}} />
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
                                    <FiArrowDown size={16} color="#006B3F" alt="Botão de ordem decrescente" data-tip="Ordenar por nome de forma decrescente"/>
                                    <ReactTooltip place="bottom"/>
                                </button>
                                <button onClick={() => sortFilter('name', 'asc')} type="button">
                                    <FiArrowUp size={16} color="#006B3F" alt="Botão de ordem crescente" data-tip="Ordenar por nome de forma crescente"/>
                                    <ReactTooltip place="bottom"/>
                                </button>
                            </th>
                            <th>
                                CLASSIFICAÇÃO
                                <button onClick={() => sortFilter('classification', 'desc')} type="button">
                                    <FiArrowDown size={16} color="#006B3F" alt="Botão de ordem decrescente" data-tip="Ordenar por classificação de forma decrescente"/>
                                    <ReactTooltip place="bottom"/>
                                </button>
                                <button onClick={() => sortFilter('classification', 'asc')} type="button">
                                    <FiArrowUp size={16} color="#006B3F" alt="Botão de ordem crescente" data-tip="Ordenar por classificação de forma crescente"/>
                                    <ReactTooltip place="bottom"/>
                                </button>
                            </th>
                            <th>
                                VALOR
                                <button onClick={() => sortFilter('value', 'desc')} type="button">
                                    <FiArrowDown size={16} color="#006B3F" alt="Botão de ordem decrescente" data-tip="Ordenar por valor de forma decrescente"/>
                                    <ReactTooltip place="bottom"/>
                                </button>
                                <button onClick={() => sortFilter('value', 'asc')} type="button">
                                    <FiArrowUp size={16} color="#006B3F" alt="Botão de ordem crescente" data-tip="Ordenar por valor de forma crescente"/>
                                    <ReactTooltip place="bottom"/>
                                </button>
                            </th>
                            <th></th>
                        </tr>
                    </thead>
                    <Modal
                        isOpen={modalToEditIsOpen}
                        id="modal-to-edit"
                        ariaHideApp={false}
                    >
                        <img src={logoImg} alt="Go To Million" />
                        <span>{modalText}</span>
                        <form onSubmit={handleEditMovement}>
                            <label className="form-label" htmlFor={nameToEdit}>Nome</label>
                            <input 
                                placeholder="Ex.: Salário"
                                value={nameToEdit}
                                onChange={e => setNameToEdit(e.target.value)}
                            />
                            <label className="form-label" htmlFor={classificationToEdit}>Classificação</label>
                            <select id={classificationToEdit} name="classificationToEdit" value={classificationToEdit} onChange={(e) => { setClassificationToEdit(e.target.value)}}>
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
                            <label className="form-label" htmlFor={valueToEdit}>Valor</label>
                            <input 
                                placeholder="Ex.: 1100"
                                value={valueToEdit}
                                onChange={e => setValueToEdit(e.target.value)}
                            />
                            
                        </form>
                        <div>
                            <button className="cancel-modal-button" onClick={() => closeModal()}>Cancelar</button>
                            <Button className="button" onClick={() => handleEditMovement()} loading={loading}>Editar</Button>
                        </div>
                    </Modal>
                    <Modal
                        isOpen={modalToConfirmIsOpen}
                        id="modal-to-confirm"
                        ariaHideApp={false}
                    >
                        <img src={logoImg} alt="Go To Million" />
                        <span>{modalText}</span>
                        <div>
                            <button className="cancel-modal-button" onClick={() => closeModal()}>Não</button>
                            <button onClick={() => handleDeleteMovement()}>Sim</button>
                        </div>
                    </Modal>
                    <tbody>
                        {movements.map(movement => (
                            <tr key={movement.id}>
                                <td className="name">{movement.name}</td>
                                <td className="classification">{movement.classification}</td>
                                <td>{Intl.NumberFormat('pt-BR', {style: 'currency', currency: 'BRL'}).format(movement.value)}</td>
                                <td>
                                    <button onClick={() => openModalToEdit(movement)} type="button">
                                        <FiEdit2 size={20} color="#a8a8b3" alt="Botão de editar movimento" data-tip="Editar movimento"/>
                                        <ReactTooltip place="bottom"/>
                                    </button>
                                    <button onClick={() => openModalToConfirm(movement.id)} type="button">
                                        <FiTrash2 size={20} color="#a8a8b3" alt="Botão de excluir movimento" data-tip="Excluir movimento"/>
                                        <ReactTooltip place="bottom"/>
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