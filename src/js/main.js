// Main application entry point
import { Navbar } from '../components/Navbar';
import { Timeline } from '../components/Timeline';

document.addEventListener('DOMContentLoaded', () => {
    // Initialize components
    new Navbar().init();
    new Timeline().init();
});
