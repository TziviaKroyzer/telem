import React, { useState } from 'react';

const Donate = () => {
    const [amount, setAmount] = useState('');
    const [customAmount, setCustomAmount] = useState('');
    const [showMessage, setShowMessage] = useState(false);

    const handleDonate = () => {
        const donationAmount = customAmount || amount;
        if (donationAmount) {
            alert(`You donated $${donationAmount} - Thank you!`);
            setShowMessage(true);
        }
    };

    const handleCustomAmountChange = (e) => {
        const value = e.target.value;
        if (value >= 1 && value <= 1000) {
            setCustomAmount(value);
            setAmount('');
        }
    };

    return (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <h1>Donate</h1>
            <div>
                <button onClick={() => { setAmount(50); setCustomAmount(''); }}>$50</button>
                <button onClick={() => { setAmount(100); setCustomAmount(''); }}>$100</button>
                <input
                    type="number"
                    placeholder="Other (1-1000)"
                    value={customAmount}
                    onChange={handleCustomAmountChange}
                />
            </div>
            <div style={{ marginTop: '20px' }}>
                <button onClick={handleDonate}>Donate</button>
            </div>
            {showMessage && <p>Thank you for your generosity!</p>}
        </div>
    );
};

export default Donate;