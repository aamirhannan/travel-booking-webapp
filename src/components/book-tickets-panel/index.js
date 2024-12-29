import { Button, TextField, Tooltip } from '@mui/material';
import React from 'react';
import Show from '../conditional-render/Show';

const BookTicketsPanel = ({ numSeats, setNumSeats, isBooking, handleBookTickets, handleCancelTicket, userTickets, isCancelling, setShowSnackbar }) => {
    return (
        <div className="booked-tickets">
            <TextField className="seat-input" label="Book ticket" variant="outlined" type="number" defaultValue={numSeats} min={1} max={7} onChange={(e) => setNumSeats(e.target.value)} />
            <div className="button-container">
                <Show when={isBooking}>
                    <Tooltip title="Booking in progress" placement="top" arrow>
                        <span>
                            <Button disabled={true} variant="contained" color="primary">Book Ticket</Button>
                        </span>
                    </Tooltip>
                </Show>
                <Show when={!isBooking}>
                    <Button variant="contained" color="primary" onClick={handleBookTickets}>Book Ticket</Button>
                </Show>

                <Show when={userTickets.length === 0}>
                    <Tooltip title="You have no bookings" placement="top" arrow>
                        <span>
                            <Button variant="contained" color="error" disabled={true}>Cancel Your Bookings</Button>
                        </span>
                    </Tooltip>
                </Show>
                <Show when={userTickets.length > 0}>
                    <Button disabled={isCancelling} variant="contained" color="error" onClick={handleCancelTicket}>Cancel Your Bookings</Button>
                </Show>

            </div>
        </div >
    );
};

export default BookTicketsPanel;