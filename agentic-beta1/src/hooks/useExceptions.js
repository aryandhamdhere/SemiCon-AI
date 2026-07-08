import { useState, useEffect } from 'react';
import axios from 'axios';

export const useExceptions = () => {
    const [exceptions, setExceptions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchExceptions = async () => {
            try {
                // Call your Python backend!
                const response = await axios.get('https://semicon-ai.onrender.com/exceptions');
                
                // Reverse the array so the newest exceptions show up at the top
                setExceptions(response.data.reverse());
                setLoading(false);
            } catch (error) {
                console.error("❌ Error fetching exceptions from backend:", error);
            }
        };

        // Fetch immediately when the component loads
        fetchExceptions();

        // Check for new exceptions every 5 seconds (Polling)
        const interval = setInterval(fetchExceptions, 5000);
        
        // Cleanup the timer if the user leaves the page
        return () => clearInterval(interval);
    }, []);

    return { exceptions, loading };
};