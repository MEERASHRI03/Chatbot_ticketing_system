import { render, screen } from '@testing-library/react';
import ChatBookingWidget from './components/chatbot/ChatBookingWidget';

test('renders ChatBookingWidget assistant title', () => {
  render(<ChatBookingWidget />);
  const titleElement = screen.getByText(/Monument Ticketing Bot/i);
  expect(titleElement).toBeInTheDocument();
});
