import React, {useState} from 'react';

interface HeaderProps{
    title: string;
    //title: string; //CAMPO OBRIGATÓRIO
    //title?: string; // CAMPO NÃO OBRIGATÓRIO
}

const Header: React.FC<HeaderProps> = (props) => {
    return(
        <header>
            <h1>{props.title}</h1>
        </header>
    );
}

export default Header;