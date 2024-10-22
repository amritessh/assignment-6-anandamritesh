
// event class with properties as per the requirements in the assignment
class Event {
    constructor(name, date, description, location, creationDate = new Date()) {
        this.name = name;
        this.date = date;
        this.description = description;
        this.location = location;
        this.creationDate = creationDate;
        this.upcoming = true;
        this.completed = false;
        this.isEditing = false;
    }
}

// event class constructor
class EventPlanner {
    constructor() {
        this.events = [];
        this.eventList = document.getElementById('eventList');
        this.createEventBtn = document.getElementById('create-event-button');
        this.eventModal = document.getElementById('eventModal');
        this.eventForm = document.getElementById('eventForm');
        this.closeBtn = document.querySelector('.close');

        this.init();
    }
//initialise event listeners and fetch events
    init() {
        this.fetchEvents();
        this.createEventBtn.addEventListener('click', () => this.showModal());
        this.closeBtn.addEventListener('click', () => this.hideModal());
        this.eventForm.addEventListener('submit', (e) => this.handleFormSubmit(e));
    }

    
    // fetch events using the XMLHTTPRequest from the JSON file
    fetchEvents() {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', 'data/event-data.json', true);
        xhr.onload = () => {
            if (xhr.status === 200) {
                const data = JSON.parse(xhr.responseText);
                this.events = data.map(event => new Event(event.name,new Date(event.date),event.description,
                    event.location,new Date(event.creationDate)));
                this.renderEvents();}
        };
        xhr.send();
    }

// UI rendering as per the requirement
    renderEvents() {
        this.eventList.innerHTML = '';
        this.events.forEach((event, index) => {
            const eventCard = document.createElement('div');
            eventCard.classList.add('event-card');
            if (event.completed) {
                eventCard.classList.add('completed');
            } else if (event.upcoming) {
                eventCard.classList.add('upcoming');
            }

            const truncatedDescription = this.truncateDescription(event.description);

           
           //HTML Structure for the event class
            eventCard.innerHTML = `
                <h2>${event.name}</h2>
                <p class="event-description">${truncatedDescription}</p>
                <div class="event-details" style="display: none;">
                    <p><strong>Date:</strong> ${event.date.toLocaleDateString()}</p>
                    <p><strong>Location:</strong> ${event.location}</p>
                    <p><strong>Created:</strong> ${event.creationDate.toLocaleString()}</p>
                    <p><strong>Description:</strong> ${event.description}</p>
                    <label>
                        <input type="checkbox" class="upcoming-checkbox" ${event.upcoming ? 'checked' : ''}>
                        Upcoming
                    </label>
                    <label>
                        <input type="checkbox" class="completed-checkbox" ${event.completed ? 'checked' : ''}>
                        Completed
                    </label>
                    <button class="edit-button">Edit</button>
                </div>
            `;

            const detailsDiv = eventCard.querySelector('.event-details');
            const upcomingCheckbox = eventCard.querySelector('.upcoming-checkbox');
            const completedCheckbox = eventCard.querySelector('.completed-checkbox');
            const editButton = eventCard.querySelector('.edit-button');

            // event listeners
            eventCard.addEventListener('click', (e) => {
                if (!e.target.matches('input[type="checkbox"], button')) {
                    this.toggleEventDetails(detailsDiv);
                }
            });

            upcomingCheckbox.addEventListener('change', () => this.toggleEventStatus(index, 'upcoming'));
            completedCheckbox.addEventListener('change', () => this.toggleEventStatus(index, 'completed'));
            editButton.addEventListener('click', () => this.editEvent(index));

            this.eventList.appendChild(eventCard);
        });
    }

    //truncating description logic to 10 words as per the assignment guidelines
    truncateDescription(description) {
        const words = description.split(' ');
        if (words.length > 10) {
            return words.slice(0, 10).join(' ') + '...';
        }
        return description;
    }

    // toggling event detail visibility
    toggleEventDetails(detailsDiv) {
        detailsDiv.style.display = detailsDiv.style.display === 'none' ? 'block' : 'none';
    }

    // toggling event status as in the assignment requirements
    toggleEventStatus(index, status) {
        if (status === 'upcoming') {
            this.events[index].upcoming = !this.events[index].upcoming;
            if (this.events[index].upcoming) {
                this.events[index].completed = false;
            }
        } else if (status === 'completed') {
            this.events[index].completed = !this.events[index].completed;
            if (this.events[index].completed) {
                this.events[index].upcoming = false;
            }
        }
        this.renderEvents();
    }

    // editing existing event
    editEvent(index) {
        if (index >= 0 && index < this.events.length) {
            const event = this.events[index];
            this.showModal(true, event);
            this.eventForm.onsubmit = (e) => {
                e.preventDefault();
                this.handleFormSubmit(e, index);
            };
        } else {
            console.error('Event not found');
        }
    }


    
    showModal(editing = false, event = null) {
        this.eventModal.style.display = 'block';
        this.isEditing = editing;
    
        if (editing && event) {
            document.getElementById('eventName').value = event.name;
            document.getElementById('eventDate').value = event.date.toISOString().split('T')[0];
            document.getElementById('eventLocation').value = event.location;
            document.getElementById('eventDescription').value = event.description;
            document.querySelector('button[type="submit"]').textContent = 'Update Event';
            this.eventForm.dataset.editIndex = this.events.indexOf(event);
        } else {
            this.eventForm.reset();
            document.querySelector('button[type="submit"]').textContent = 'Create Event';
            delete this.eventForm.dataset.editIndex;
        }
    }

    // handling form submission
    handleFormSubmit(e) {
        e.preventDefault();
        const name = document.getElementById('eventName').value;
        const date = new Date(document.getElementById('eventDate').value);
        const location = document.getElementById('eventLocation').value;
        const description = document.getElementById('eventDescription').value;
    
        const editIndex = this.eventForm.dataset.editIndex;
        if (editIndex !== undefined) {
            // Editing existing event
            const index = parseInt(editIndex, 10);
            if (index >= 0 && index < this.events.length) {
                const event = this.events[index];
                event.name = name;
                event.date = date;
                event.location = location;
                event.description = description;
                console.log(`Updated event at index ${index}`);
            }
        } else {
            // Creating new event
            const newEvent = new Event(name, date, description, location, new Date());
            this.events.push(newEvent);
            console.log('Created new event');
        }
    
        this.renderEvents();
        this.hideModal();
    }

    hideModal() {
        this.eventModal.style.display = 'none';
        this.isEditing = false; // Reset editing state
        this.eventForm.onsubmit = (e) => this.handleFormSubmit(e);
    }
}

// initialising the event planner
const eventPlanner = new EventPlanner();