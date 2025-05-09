import React, {useEffect, useState} from 'react';
import './NavBarPages.css';
import './Homepage.css';

const Homepage = () => {
    const[firstName, setFirstName]=useState('');
    const[quote, setQuote]=useState({text: '', author: ''});

    useEffect(()=>{
        const role=localStorage.getItem('role');
        let userFirstName='';

        if(role==='1'){
            userFirstName=localStorage.getItem('professorFirstName');
        }
        else if(role==='2'){
            userFirstName=localStorage.getItem('studentFirstName');
        }else if(role==='3'){
            userFirstName='Admin';
        }

        setFirstName(userFirstName||'User');

        setQuote(getDailyQuote());

    }, [])
    return (
        <div className='page-layout'>
            <div className='page-components'>
                <div className='greeting-container'>
                    <h1 className='greeting'>Hi, {firstName}!</h1>
                    <div className='quote-container'>
                        <p className='quote-text'>{quote.text}</p>
                        <p className='quote-author'>- {quote.author}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const getDailyQuote=()=>{
    const quotes = [
        { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
        { text: "Success is not final, failure is not fatal: It is the courage to continue that counts.", author: "Winston Churchill" },
        { text: "Education is the most powerful weapon which you can use to change the world.", author: "Nelson Mandela" },
        { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
        { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
        { text: "Your time is limited, don't waste it living someone else's life.", author: "Steve Jobs" },
        { text: "In the middle of difficulty lies opportunity.", author: "Albert Einstein" },
        { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
        { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
        { text: "The best way to predict the future is to create it.", author: "Peter Drucker" },
        { text: "Learning is not attained by chance, it must be sought for with ardor and attended to with diligence.", author: "Abigail Adams" },
        { text: "The mind is not a vessel to be filled, but a fire to be kindled.", author: "Plutarch" },
        { text: "Live as if you were to die tomorrow. Learn as if you were to live forever.", author: "Mahatma Gandhi" },
        { text: "Knowledge is power. Information is liberating.", author: "Kofi Annan" },
        { text: "The beautiful thing about learning is that no one can take it away from you.", author: "B.B. King" }
    ];

    const today = new Date();
    const dateString = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
    
    //simple hash from the date string
    let hash = 0;
    for (let i = 0; i < dateString.length; i++) {
        hash = ((hash << 5) - hash) + dateString.charCodeAt(i);
        hash |= 0;
    }

    //using hash i made earlier to pick a quote
    const index = Math.abs(hash) % quotes.length;
    return quotes[index];
}

export default Homepage;