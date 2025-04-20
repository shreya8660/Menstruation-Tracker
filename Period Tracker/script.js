// Time and date management
function updateTime() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const timeString = `${hours}:${minutes}`;
    
    document.querySelectorAll('.time').forEach(el => {
        el.textContent = timeString;
    });
    
    // Update greeting based on time of day
    const greeting = document.querySelector('.greeting');
    if (greeting) {
        if (hours < 12) {
            greeting.innerHTML = 'Good Morning Have some breakfast <span class="emoji">🌞</span>';
        } else if (hours < 16) {
            greeting.innerHTML = 'Good Afternoon Have Lunch<span class="emoji">🌤️</span>';
        } else if (hours < 18){
            greeting.innerHTML = 'Good Evening Beautiful<span class="emoji">🫶</span>';
        }else {
            greeting.innerHTML = 'Good Night Have a Great Sleep<span class="emoji">🌙</span>';
        }
    }
    
    setTimeout(updateTime, 60000); // Update every minute
}

// Period tracking data
let userData = {
    periodDays: [],
    lastPeriodStartDate: new Date(2025, 3, 18), 
    cycleLength: 28,
    periodLength: 5
};

// Initialize period days based on last period start date
function initPeriodData() {
    const startDate = new Date(userData.lastPeriodStartDate);
    userData.periodDays = [];
    
    // Add current period days
    for (let i = 0; i < userData.periodLength; i++) {
        const periodDay = new Date(startDate);
        periodDay.setDate(startDate.getDate() + i);
        userData.periodDays.push(periodDay.toISOString().split('T')[0]);
    }
    
    // Add previous periods (3 cycles)
    for (let cycle = 1; cycle <= 3; cycle++) {
        const prevCycleStart = new Date(startDate);
        prevCycleStart.setDate(startDate.getDate() - (cycle * userData.cycleLength));
        
        for (let i = 0; i < userData.periodLength; i++) {
            const periodDay = new Date(prevCycleStart);
            periodDay.setDate(prevCycleStart.getDate() + i);
            userData.periodDays.push(periodDay.toISOString().split('T')[0]);
        }
    }
    
    // Add future predicted periods (3 cycles)
    for (let cycle = 1; cycle <= 3; cycle++) {
        const nextCycleStart = new Date(startDate);
        nextCycleStart.setDate(startDate.getDate() + (cycle * userData.cycleLength));
        
        for (let i = 0; i < userData.periodLength; i++) {
            const periodDay = new Date(nextCycleStart);
            periodDay.setDate(nextCycleStart.getDate() + i);
            userData.periodDays.push(periodDay.toISOString().split('T')[0]);
        }
    }
    
    // Save to local storage
    saveUserData();
    
    // Update homepage information
    updateHomePageInfo();
}

// Save user data to localStorage
function saveUserData() {
    localStorage.setItem('periodTrackerData', JSON.stringify(userData));
}

// Load user data from localStorage
function loadUserData() {
    const savedData = localStorage.getItem('periodTrackerData');
    if (savedData) {
        userData = JSON.parse(savedData);
        userData.lastPeriodStartDate = new Date(userData.lastPeriodStartDate);
    } else {
        initPeriodData();
    }
}

// Update homepage information based on current period status
function updateHomePageInfo() {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    // Check if today is a period day
    const isPeriodDay = userData.periodDays.includes(todayStr);
    
    // Find which day of period it is if applicable
    if (isPeriodDay) {
        // Get the start of the current period
        const currentPeriodStart = new Date(today);
        for (let i = 0; i < userData.periodLength; i++) {
            const checkDate = new Date(today);
            checkDate.setDate(today.getDate() - i);
            const checkDateStr = checkDate.toISOString().split('T')[0];
            
            // If we found a day that's not a period day, we know the previous day was the start
            if (!userData.periodDays.includes(checkDateStr)) {
                currentPeriodStart.setDate(today.getDate() - i + 1);
                break;
            }
            
            // If we reached the beginning of the period
            if (i === userData.periodLength - 1) {
                currentPeriodStart.setDate(today.getDate() - i);
            }
        }
        
        // Calculate which day of period
        const diffTime = Math.abs(today - currentPeriodStart);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 0;
        
        // Update the subheader
        document.querySelector('.subheader').textContent = `Hyy It's your ${getOrdinalNum(diffDays)} day.`;
        
        // Update phase information
        document.querySelector('.phase-name').textContent = "MENSTRUATION";
    } else {
        // Calculate days until next period
        const nextPeriodDate = getNextPeriodDate(today);
        const diffTime = Math.abs(nextPeriodDate - today);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) {
            document.querySelector('.subheader').textContent = `Sayli! Your period is expected to start today.`;
        } else {
            document.querySelector('.subheader').textContent = `Sayli! ${diffDays} days until your next period.`;
        }
        
        // Determine current cycle phase
        const lastPeriodEnd = new Date(userData.lastPeriodStartDate);
        lastPeriodEnd.setDate(lastPeriodEndDate + userData.periodLength);
        
        const ovulationDate = new Date(userData.lastPeriodStartDate);
        ovulationDate.setDate(ovulationDate.getDate() + Math.floor(userData.cycleLength / 2));
        
        if (today > lastPeriodEnd && today < ovulationDate) {
            document.querySelector('.phase-name').textContent = "FOLLICULAR";
        } else if (today.toDateString() === ovulationDate.toDateString()) {
            document.querySelector('.phase-name').textContent = "OVULATION";
        } else {
            document.querySelector('.phase-name').textContent = "LUTEAL";
        }
    }
    
    // Update week days and dates on homepage
    updateWeekDisplay(today);
}

// Helper function to get ordinal number (1st, 2nd, 3rd, etc.)
function getOrdinalNum(n) {
    return n + (n > 0 ? ['th', 'st', 'nd', 'rd'][(n > 3 && n < 21) || n % 10 > 3 ? 0 : n % 10] : '');
}

// Get the date of the next period
function getNextPeriodDate(fromDate) {
    const startDate = new Date(userData.lastPeriodStartDate);
    let nextPeriod = new Date(startDate);
    
    while (nextPeriod <= fromDate) {
        nextPeriod.setDate(nextPeriod.getDate() + userData.cycleLength);
    }
    
    return nextPeriod;
}

// Update week display on homepage
function updateWeekDisplay(centerDate) {
    const weekDays = document.querySelector('.week-days');
    const datesRow = document.querySelector('.dates');
    
    if (!weekDays || !datesRow) return;
    
    weekDays.innerHTML = '';
    datesRow.innerHTML = '';
    
    // Calculate start date (3 days before center date)
    const startDate = new Date(centerDate);
    startDate.setDate(centerDate.getDate() - 3);
    
    // Get day names and dates for a week
    const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    
    for (let i = 0; i < 7; i++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + i);
        
        // Add day name
        const dayDiv = document.createElement('div');
        dayDiv.className = 'day';
        dayDiv.textContent = dayNames[currentDate.getDay()];
        weekDays.appendChild(dayDiv);
        
        // Add date
        const dateDiv = document.createElement('div');
        dateDiv.className = 'date';
        
        // Check if it's current date
        if (currentDate.toDateString() === centerDate.toDateString()) {
            dateDiv.classList.add('active');
        }
        
        // Check if it's a period day
        const dateStr = currentDate.toISOString().split('T')[0];
        if (userData.periodDays.includes(dateStr)) {
            dateDiv.classList.add('highlighted');
        }
        
        dateDiv.textContent = currentDate.getDate();
        datesRow.appendChild(dateDiv);
    }
}

// Calendar functionality
let currentDate = new Date();
let currentMonth = currentDate.getMonth();
let currentYear = currentDate.getFullYear();

function initCalendar() {
    updateCalendarHeader();
    renderCalendar();
    
    // Add period update modal if it doesn't exist
    if (!document.getElementById('period-update-modal')) {
        createPeriodUpdateModal();
    }
}

function updateCalendarHeader() {
    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"];
    
    document.querySelector('.month-name').textContent = monthNames[currentMonth];
    document.querySelector('.year').textContent = currentYear;
}

function renderCalendar() {
    const calendarDisplay = document.getElementById('calendar-display');
    if (!calendarDisplay) return;
    
    calendarDisplay.innerHTML = '';
    
    // Create weekday headers
    const weekdays = document.createElement('div');
    weekdays.className = 'calendar-weekdays';
    ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].forEach(day => {
        const dayEl = document.createElement('div');
        dayEl.className = 'calendar-weekday';
        dayEl.textContent = day;
        weekdays.appendChild(dayEl);
    });
    calendarDisplay.appendChild(weekdays);
    
    // Calculate days in month and first day of month
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    const daysGrid = document.createElement('div');
    daysGrid.className = 'calendar-days';
    
    // Add empty cells for days before the first day of month
    for (let i = 0; i < firstDay; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'calendar-day empty';
        daysGrid.appendChild(emptyDay);
    }
    
    // Add actual days
    for (let day = 1; day <= daysInMonth; day++) {
        const dayEl = document.createElement('div');
        dayEl.className = 'calendar-day';
        dayEl.textContent = day;
        
        // Create date string for comparison
        const dateObj = new Date(currentYear, currentMonth, day);
        const dateStr = dateObj.toISOString().split('T')[0];
        
        // Mark period days
        if (userData.periodDays.includes(dateStr)) {
            dayEl.classList.add('period-day');
        }
        
        // Calculate and mark ovulation day (14 days before next period)
        const ovulationDate = new Date(userData.lastPeriodStartDate);
        ovulationDate.setDate(ovulationDate.getDate() + Math.floor(userData.cycleLength / 2));
        
        if (dateObj.toDateString() === ovulationDate.toDateString()) {
            dayEl.classList.add('ovulation-day');
        }
        
        // Mark current day
        if (day === currentDate.getDate() && 
            currentMonth === currentDate.getMonth() && 
            currentYear === currentDate.getFullYear()) {
            dayEl.classList.add('current-day');
        }
        
        // Add click event for updating period
        dayEl.addEventListener('click', () => {
            openPeriodUpdateModal(new Date(currentYear, currentMonth, day));
        });
        
        daysGrid.appendChild(dayEl);
    }
    
    calendarDisplay.appendChild(daysGrid);
    
    // Add period update button
    const updateButtonContainer = document.createElement('div');
    updateButtonContainer.className = 'update-period-container';
    
    const updateButton = document.createElement('button');
    updateButton.className = 'update-period-button';
    updateButton.textContent = 'Update Period';
    updateButton.addEventListener('click', () => {
        openPeriodUpdateModal(new Date());
    });
    
    updateButtonContainer.appendChild(updateButton);
    calendarDisplay.appendChild(updateButtonContainer);
}

function createPeriodUpdateModal() {
    const modal = document.createElement('div');
    modal.id = 'period-update-modal';
    modal.className = 'period-update-modal';
    
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close-modal">&times;</span>
            <h2>Update Period Date</h2>
            <p>Mark the start date of your period:</p>
            <div class="date-display"></div>
            <div class="period-length">
                <label>Period Length: </label>
                <select id="period-length-select">
                    <option value="3">3 days</option>
                    <option value="4">4 days</option>
                    <option value="5" selected>5 days</option>
                    <option value="6">6 days</option>
                    <option value="7">7 days</option>
                </select>
            </div>
            <div class="modal-buttons">
                <button id="cancel-period-update">Cancel</button>
                <button id="confirm-period-update">Update</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add event listeners
    document.querySelector('.close-modal').addEventListener('click', closePeriodUpdateModal);
    document.getElementById('cancel-period-update').addEventListener('click', closePeriodUpdateModal);
    document.getElementById('confirm-period-update').addEventListener('click', confirmPeriodUpdate);
}

let selectedPeriodDate = null;

function openPeriodUpdateModal(date) {
    selectedPeriodDate = date;
    const modal = document.getElementById('period-update-modal');
    
    // Update date display
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.querySelector('.date-display').textContent = date.toLocaleDateString('en-US', options);
    
    // Set current period length
    document.getElementById('period-length-select').value = userData.periodLength;
    
    // Show modal with animation
    modal.style.display = 'flex';
    setTimeout(() => {
        modal.classList.add('active');
    }, 10);
}

function closePeriodUpdateModal() {
    const modal = document.getElementById('period-update-modal');
    modal.classList.remove('active');
    setTimeout(() => {
        modal.style.display = 'none';
    }, 300);
}

function confirmPeriodUpdate() {
    if (!selectedPeriodDate) return;
    
    const periodLength = parseInt(document.getElementById('period-length-select').value);
    
    // Update user data
    userData.lastPeriodStartDate = new Date(selectedPeriodDate);
    userData.periodLength = periodLength;
    
    // Recalculate period days
    initPeriodData();
    
    // Update calendar
    renderCalendar();
    
    // Update homepage
    updateHomePageInfo();
    
    // Show confirmation message
    showNotification('Period dates updated successfully!');
    
    // Close modal
    closePeriodUpdateModal();
}

function showNotification(message) {
    // Create notification if it doesn't exist
    if (!document.getElementById('notification')) {
        const notification = document.createElement('div');
        notification.id = 'notification';
        notification.className = 'notification';
        document.body.appendChild(notification);
    }
    
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.classList.add('active');
    
    setTimeout(() => {
        notification.classList.remove('active');
    }, 3000);
}

function changeMonth(offset) {
    currentMonth += offset;
    
    if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    } else if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    }
    
    // Add animation class
    const calendarDisplay = document.getElementById('calendar-display');
    calendarDisplay.classList.add(offset > 0 ? 'slide-left' : 'slide-right');
    
    // Update calendar with animation
    setTimeout(() => {
        updateCalendarHeader();
        renderCalendar();
        calendarDisplay.classList.remove('slide-left', 'slide-right');
    }, 300);
}

// Router functionality
class Router {
    constructor() {
        this.currentPage = 'home';
        this.pages = {};
        this.initRouter();
    }
    
    initRouter() {
        // Initialize all pages
        document.querySelectorAll('.page').forEach(page => {
            const id = page.id;
            this.pages[id] = page;
        });
        
        // Set up navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', () => {
                const pageId = item.getAttribute('data-page');
                this.navigateTo(pageId);
            });
        });
        
        // Initialize with home page
        this.showPage('home');
    }
    
    navigateTo(pageId) {
        if (this.currentPage === pageId) return;
        
        // Hide current page with exit animation
        const currentPageEl = this.pages[this.currentPage];
        currentPageEl.classList.add('page-exit');
        
        setTimeout(() => {
            currentPageEl.classList.remove('active', 'page-exit');
            
            // Show new page with enter animation
            const newPageEl = this.pages[pageId];
            newPageEl.classList.add('active', 'page-enter');
            
            // Update navigation
            document.querySelectorAll('.nav-item').forEach(item => {
                if (item.getAttribute('data-page') === pageId) {
                    item.classList.add('active');
                } else {
                    item.classList.remove('active');
                }
            });
            
            setTimeout(() => {
                newPageEl.classList.remove('page-enter');
            }, 300);
            
            this.currentPage = pageId;
            
            // Specific page initializations
            if (pageId === 'calendar') {
                initCalendar();
            }
            
        }, 300);
    }
    
    showPage(pageId) {
        // Hide all pages
        Object.values(this.pages).forEach(page => {
            page.classList.remove('active');
        });
        
        // Show selected page
        this.pages[pageId].classList.add('active');
        this.currentPage = pageId;
        
        // Update navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            if (item.getAttribute('data-page') === pageId) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }
}

// Add water animation
function animateWaterAlerts() {
    const alerts = document.querySelectorAll('.alert');
    alerts.forEach((alert, index) => {
        setTimeout(() => {
            alert.classList.add('active');
            setTimeout(() => {
                alert.classList.remove('active');
                alert.classList.add('fade-out');
                setTimeout(() => {
                    alert.classList.remove('fade-out');
                    alert.classList.add('fade-in');
                }, 500);
            }, 5000);
        }, index * 1000);
    });
    
    setTimeout(animateWaterAlerts, 10000); // Repeat every 10 seconds
}

// Stats page animations
function animateStats() {
    const statCharts = document.querySelectorAll('.chart-bar');
    statCharts.forEach((bar, index) => {
        setTimeout(() => {
            bar.classList.add('grow');
        }, index * 100);
    });
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Load user data
    loadUserData();
    
    // Initialize router
    window.router = new Router();
    
    // Make direct navigation functions work
    window.navigateTo = function(pageId) {
        window.router.navigateTo(pageId);
    };
    
    // Initialize time
    updateTime();
    
    // Update homepage info
    updateHomePageInfo();
    
    // Initialize calendar
    initCalendar();
    
    // Start animations
    animateWaterAlerts();
    
    // Add listener for stats page
    document.querySelector('[data-page="stats"]').addEventListener('click', () => {
        setTimeout(animateStats, 500);
    });
    
    // Add phase circle animation
    document.querySelector('.phase-circle').classList.add('pulse');
    setInterval(() => {
        document.querySelector('.phase-circle').classList.toggle('pulse');
    }, 5000);
    
    // Add transitions for stats
    document.querySelectorAll('.stat').forEach((stat, index) => {
        setTimeout(() => {
            stat.classList.add('appear');
        }, 500 + index * 200);
    });
});

// Add these CSS classes to support the animations
document.addEventListener('DOMContentLoaded', function() {
    const style = document.createElement('style');
    style.textContent = `
        .page {
            display: none;
            opacity: 0;
            transition: opacity 0.3s ease-in-out;
        }
        
        .page.active {
            display: block;
            opacity: 1;
        }
        
        
        .slide-left {
            animation: slideLeft 0.3s ease-in-out;
        }
        
        .slide-right {
            animation: slideRight 0.3s ease-in-out;
        }
        
        @keyframes slideLeft {
            from { transform: translateX(0); }
            to { transform: translateX(-20px); opacity: 0; }
        }
        
        @keyframes slideRight {
            from { transform: translateX(0); }
            to { transform: translateX(20px); opacity: 0; }
        }
        
        .calendar-day {
            transition: all 0.2s ease-in-out;
            cursor: pointer;
        }
        
        .calendar-day:hover {
            background-color: #ffd6e7;
            transform: scale(1.1);
        }
        
        .period-day {
            background-color: #ff93c8;
            color: white;
            border-radius: 50%;
        }
        
        .ovulation-day {
            background-color: #93b8ff;
            color: white;
            border-radius: 50%;
        }
        
        .current-day {
            border: 2px solid #333;
            font-weight: bold;
        }
        
        .pulse {
            animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
        }
        
        .chart-bar {
            height: 0 !important;
            transition: height 1s ease-out;
        }
        
        .chart-bar.grow {
            height: var(--original-height) !important;
        }
        
        .alert {
            opacity: 0;
            transform: translateY(20px);
            transition: all 0.5s ease-in-out;
        }
        
        .alert.active {
            opacity: 1;
            transform: translateY(0);
        }
        
        .alert.fade-out {
            opacity: 0;
            transform: translateY(-20px);
        }
        
        .fade-in {
            animation: fadeIn 0.5s ease-in-out;
        }
        
        .stat {
            opacity: 0;
            transform: translateY(20px);
        }
        
        .stat.appear {
            opacity: 1;
            transform: translateY(0);
            transition: all 0.5s ease-in-out;
        }
        
        .calendar-weekdays {
            display: grid;
            grid-template-columns: repeat(7, 1fr);
            text-align: center;
            font-weight: bold;
            margin-bottom: 10px;
        }
        
        .calendar-days {
            display: grid;
            grid-template-columns: repeat(7, 1fr);
            gap: 5px;
            margin-bottom: 20px;
        }
        
        .calendar-day {
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .calendar-day.empty {
            background: transparent;
            cursor: default;
        }
        
        .update-period-container {
            display: flex;
            justify-content: center;
            margin-top: 20px;
        }
        
        .update-period-button {
            background-color: #ff4081;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 20px;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.2s ease-in-out;
        }
        
        .update-period-button:hover {
            background-color: #ff6699;
            transform: scale(1.05);
        }
        
        .period-update-modal {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            z-index: 1000;
            justify-content: center;
            align-items: center;
            opacity: 0;
            transition: opacity 0.3s ease-in-out;
        }
        
        .period-update-modal.active {
            opacity: 1;
        }
        
        .modal-content {
            background-color: white;
            padding: 20px;
            border-radius: 15px;
            width: 80%;
            max-width: 400px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
            transform: translateY(20px);
            transition: transform 0.3s ease-in-out;
        }
        
        .period-update-modal.active .modal-content {
            transform: translateY(0);
        }
        
        .close-modal {
            float: right;
            font-size: 24px;
            font-weight: bold;
            cursor: pointer;
        }
        
        .date-display {
            margin: 20px 0;
            padding: 10px;
            background-color: #f8f8f8;
            border-radius: 10px;
            text-align: center;
            font-weight: bold;
        }
        
        .period-length {
            margin: 20px 0;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
        
        .period-length select {
            padding: 8px;
            border-radius: 8px;
            border: 1px solid #ddd;
        }
        
        .modal-buttons {
            display: flex;
            justify-content: space-between;
            margin-top: 20px;
        }
        
        .modal-buttons button {
            padding: 10px 20px;
            border-radius: 20px;
            border: none;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.2s ease-in-out;
        }
        
        #cancel-period-update {
            background-color: #f1f1f1;
            color: #333;
        }
        
        #confirm-period-update {
            background-color: #ff4081;
            color: white;
        }
        
        .modal-buttons button:hover {
            transform: scale(1.05);
        }
        
        .notification {
            position: fixed;
            bottom: -60px;
            left: 50%;
            transform: translateX(-50%);
            background-color: #4CAF50;
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            font-weight: bold;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
            transition: bottom 0.3s ease-in-out;
            z-index: 1001;
        }
        
        .notification.active {
            bottom: 20px;
        }
    `;
    document.head.appendChild(style);
    
    // Store original height values for chart bars
    document.querySelectorAll('.chart-bar').forEach(bar => {
        const height = bar.style.height;
        bar.style.setProperty('--original-height', height);
        bar.style.height = '0';
    });
});
// Profile update functionality
let profileData = {
    "age": "26",
    "height": "165 cm",
    "weight": "58 kg",
    "average-cycle": "28 days",
    "average-period": "5 days"
};

// Function to make profile fields editable
function makeProfileEditable() {
    const profileItems = document.querySelectorAll('.profile-item');
    
    profileItems.forEach(item => {
        const label = item.querySelector('.profile-label').textContent;
        const value = item.querySelector('.profile-value').textContent;
        
        // Create input field
        const input = document.createElement('input');
        input.type = label === 'Age' ? 'number' : 'text';
        input.className = 'profile-input';
        input.value = value;
        input.name = label.toLowerCase().replace(' ', '-');
        
        // Replace value with input
        item.querySelector('.profile-value').innerHTML = '';
        item.querySelector('.profile-value').appendChild(input);
    });
    
    // Add save button if it doesn't exist
    if (!document.getElementById('save-profile')) {
        const saveButton = document.createElement('button');
        saveButton.id = 'save-profile';
        saveButton.className = 'save-profile-button';
        saveButton.textContent = 'Save Profile';
        saveButton.addEventListener('click', saveProfileChanges);
        
        // Insert before the profile settings
        document.querySelector('.profile-settings').before(saveButton);
    }
}

// Function to save profile changes
function saveProfileChanges() {
    const profileItems = document.querySelectorAll('.profile-item');
    let updatedProfile = {};
    
    profileItems.forEach(item => {
        const label = item.querySelector('.profile-label').textContent;
        const input = item.querySelector('.profile-input');
        const newValue = input.value;
        
        // Update the display
        const valueContainer = item.querySelector('.profile-value');
        valueContainer.innerHTML = newValue;
        
        // Store the updated value in our profile data object
        const key = label.toLowerCase().replace(' ', '-');
        updatedProfile[key] = newValue;
    });
    
    // Update our global profile data
    profileData = updatedProfile;
    
    // Save to localStorage
    localStorage.setItem('profileData', JSON.stringify(profileData));
    
    // Update cycle length in period tracker data if it was changed
    if (profileData['average-cycle']) {
        const cycleLength = parseInt(profileData['average-cycle']);
        if (!isNaN(cycleLength)) {
            userData.cycleLength = cycleLength;
            saveUserData();
            initPeriodData();
            updateHomePageInfo();
            if (document.getElementById('calendar').classList.contains('active')) {
                renderCalendar();
            }
        }
    }
    
    // Remove save button
    document.getElementById('save-profile').remove();
    
    // Show confirmation message
    showNotification('Profile updated successfully!');
}

// Function to load profile data from localStorage
function loadProfileData() {
    const savedProfile = localStorage.getItem('profileData');
    if (savedProfile) {
        profileData = JSON.parse(savedProfile);
        
        // Update profile display with saved data
        Object.entries(profileData).forEach(([key, value]) => {
            // Convert key back to display format
            const displayKey = key.split('-').map(word => 
                word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' ');
            
            // Find the matching profile item
            const profileItems = document.querySelectorAll('.profile-item');
            profileItems.forEach(item => {
                const label = item.querySelector('.profile-label').textContent;
                if (label.toLowerCase() === displayKey.toLowerCase()) {
                    item.querySelector('.profile-value').textContent = value;
                }
            });
        });
    }
}

// Initialize profile functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Load saved profile data
    loadProfileData();
    
    // Add event listener to edit button
    const editButton = document.getElementById('edit-profile');
    if (editButton) {
        editButton.addEventListener('click', makeProfileEditable);
    } else {
        // If button wasn't added to HTML, add it dynamically
        addEditProfileButton();
    }
});

// Function to add edit button if not present in HTML
function addEditProfileButton() {
    if (!document.getElementById('edit-profile')) {
        const editButton = document.createElement('button');
        editButton.id = 'edit-profile';
        editButton.className = 'edit-profile-button';
        editButton.textContent = 'Edit Profile';
        editButton.addEventListener('click', makeProfileEditable);
        
        // Insert after profile info
        document.querySelector('.profile-info').after(editButton);
    }
}
  
    const editBtn = document.getElementById("edit-profile");
    const nameInput = document.getElementById("profile-name-input");
    const profileInputs = document.querySelectorAll(".profile-value");

    let isEditing = false;

    editBtn.addEventListener("click", () => {
        isEditing = !isEditing;

        if (isEditing) {
            nameInput.removeAttribute("readonly");
            nameInput.classList.add("editable");

            profileInputs.forEach(input => {
                input.removeAttribute("readonly");
                input.classList.add("editable");
            });

            editBtn.textContent = "Save";
        } else {
            nameInput.setAttribute("readonly", true);
            nameInput.classList.remove("editable");

            profileInputs.forEach(input => {
                input.setAttribute("readonly", true);
                input.classList.remove("editable");
            });

            editBtn.textContent = "Edit Profile";

            // ✅ Optional: Save logic
            const updatedData = {
                name: nameInput.value,
                age: profileInputs[0].value,
                height: profileInputs[1].value,
                weight: profileInputs[2].value,
                cycle: profileInputs[3].value,
                period: profileInputs[4].value
            };
            console.log("Updated Profile:", updatedData);
        }
    });
    const emojis = [ '🩷', '🦄',  '🩸', '💋','💗','🥰','🥺','😘']; // Customize your theme
    const emojiContainer = document.querySelector('.floating-emojis');
    
    function createFloatingEmoji() {
        const emoji = document.createElement('div');
        emoji.classList.add('floating-emoji');
        emoji.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    
        const size = Math.random() * 15 + 15; // 20px to 40px
        emoji.style.fontSize = `${size}px`;
    
        const topPos = Math.random(); // 0 to 1
        emoji.style.setProperty('--randY', topPos);
    
        emoji.style.left = '-50px'; // Start off-screen
    
        emojiContainer.appendChild(emoji);
    
        // Remove the emoji after animation ends (~10s)
        setTimeout(() => {
            emoji.remove();
        }, 12000);
        
    }
    
    // Launch one every 0.5 seconds
    setInterval(createFloatingEmoji, 800);
    





