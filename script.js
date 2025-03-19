
// Configuration
const WEATHER_API_KEY = '1d4ac4ebdb19b7aebec0f58c5a36f8ef';
const BOOKING_API_URL = 'const url = `https://api.openweathermap.org/data/2.5/weather?q= mumbai&appid=1d4ac4ebdb19b7aebec0f58c5a36f8ef&units=metric'; // Replace with your booking API

// Weather API Integration
class WeatherService {
    async getWeather(city) {
        try {
            const response = await fetch(
                `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${WEATHER_API_KEY}&units=metric`
            );
            if (!response.ok) throw new Error('Weather data fetch failed');
            const data = await response.json();
            return {
                temp: Math.round(data.main.temp),
                description: data.weather[0].description,
                icon: data.weather[0].icon
            };
        } catch (error) {
            console.error('Weather fetch error:', error);
            return null;
        }
    }

    async displayWeather(box, city) {
        const weatherData = await this.getWeather(city);
        if (!weatherData) return;

        const weatherWidget = document.createElement('div');
        weatherWidget.className = 'weather-widget';
        weatherWidget.innerHTML = `
            <img src="http://openweathermap.org/img/w/${weatherData.icon}.png" alt="Weather">
            <span>${weatherData.temp}°C</span>
            <span>${weatherData.description}</span>
        `;
        box.querySelector('.content').appendChild(weatherWidget);
    }
}

// Booking System
class BookingSystem {
    constructor() {
        this.modal = document.getElementById('bookingModal');
        this.form = document.getElementById('bookingForm');
        this.messageDiv = document.getElementById('bookingMessage');
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Close modal
        document.querySelector('.modal-close').onclick = () => this.closeModal();

        // Handle form submission
        this.form.onsubmit = (e) => this.handleBooking(e);

        // Close modal when clicking outside
        window.onclick = (e) => {
            if (e.target === this.modal) this.closeModal();
        }
    }

    openModal(destination, price) {
        this.modal.style.display = 'block';
        this.currentDestination = destination;
        this.currentPrice = price;
    }

    closeModal() {
        this.modal.style.display = 'none';
        this.form.reset();
        this.messageDiv.innerHTML = '';
    }

    async handleBooking(e) {
        e.preventDefault();
        this.setLoading(true);

        const formData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            travelDate: document.getElementById('travelDate').value,
            travelers: document.getElementById('travelers').value,
            destination: this.currentDestination,
            price: this.currentPrice
        };

        try {
            const response = await this.submitBooking(formData);
            this.showMessage('Booking successful! Check your email for confirmation.', 'success');
            setTimeout(() => this.closeModal(), 3000);
        } catch (error) {
            this.showMessage(error.message, 'error');
        } finally {
            this.setLoading(false);
        }
    }

    async submitBooking(formData) {
        try {
            const response = await fetch(BOOKING_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) throw new Error('Booking submission failed');
            return await response.json();
        } catch (error) {
            throw new Error('Unable to process booking. Please try again later.');
        }
    }

    setLoading(isLoading) {
        const submitBtn = this.form.querySelector('button[type="submit"]');
        if (isLoading) {
            submitBtn.disabled = true;
            this.form.classList.add('loading');
        } else {
            submitBtn.disabled = false;
            this.form.classList.remove('loading');
        }
    }

    showMessage(message, type) {
        this.messageDiv.innerHTML = `
            <div class="message ${type}">
                ${message}
            </div>
        `;
    }
}

// Dynamic Pricing System
class PricingSystem {
    constructor() {
        this.baseRates = {
            'mumbai': 90,
            'hawaii': 70,
            'sydney': 130,
            'paris': 50
        };
        this.updateInterval = 60000; // 1 minute
        this.startUpdates();
    }

    startUpdates() {
        setInterval(() => this.updateAllPrices(), this.updateInterval);
    }

    calculateDynamicPrice(basePrice) {
        const demandFactor = 0.9 + Math.random() * 0.2;
        const seasonalFactor = this.getSeasonalFactor();
        return (basePrice * demandFactor * seasonalFactor).toFixed(2);
    }

    getSeasonalFactor() {
        const month = new Date().getMonth();
        // Peak season (June-August)
        if (month >= 5 && month <= 7) return 1.2;
        // Off season (December-February)
        if (month >= 11 || month <= 1) return 0.8;
        // Regular season
        return 1.0;
    }

    updateAllPrices() {
        document.querySelectorAll('.box').forEach(box => {
            const destination = box.querySelector('h3').textContent.toLowerCase().trim();
            const basePrice = this.baseRates[destination] || 100;
            const newPrice = this.calculateDynamicPrice(basePrice);
            
            const priceElement = box.querySelector('.price');
            priceElement.innerHTML = `$${newPrice} <span>$${(newPrice * 1.2).toFixed(2)}</span>`;
            priceElement.classList.add('price-flash');
            
            setTimeout(() => priceElement.classList.remove('price-flash'), 1000);
        });
    }
}

// Initialize all systems
document.addEventListener('DOMContentLoaded', () => {
    const weatherService = new WeatherService();
    const bookingSystem = new BookingSystem();
    const pricingSystem = new PricingSystem();

    // Initialize weather widgets
    document.querySelectorAll('.box').forEach(box => {
        const destination = box.querySelector('h3').textContent.trim();
        weatherService.displayWeather(box, destination);
    });

    // Setup booking buttons
    document.querySelectorAll('.btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const box = btn.closest('.box');
            const destination = box.querySelector('h3').textContent.trim();
            const price = box.querySelector('.price').textContent.split(' ')[0];
            bookingSystem.openModal(destination, price);
        });
    });
});
