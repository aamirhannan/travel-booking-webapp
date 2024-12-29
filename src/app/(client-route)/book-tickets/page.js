"use client";
import React, { useContext, useState, useEffect } from "react";
import { AuthContext } from "@/components/context/authContext";
import axios from "axios";
import { Button, Chip, CircularProgress, TextField, Tooltip } from "@mui/material";
import "./book-ticket.scss";
import { SeatData } from "@/components/utils";
import BookTicketsPanel from "@/components/book-tickets-panel";
import Snackbar, { SnackbarCloseReason } from '@mui/material/Snackbar';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';

export default function BookTickets() {
    const { user } = useContext(AuthContext);
    const [allBookedTickets, setAllBookedTickets] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isBooking, setIsBooking] = useState(false);
    const [mounted, setMounted] = useState(false);

    const [selectedSeats, setSelectedSeats] = useState([]);
    const [numSeats, setNumSeats] = useState(null);
    const [seatStatus, setSeatStatus] = useState([...SeatData]);
    const [userTickets, setUserTickets] = useState([]);
    const [showSnackbar, setShowSnackbar] = useState({
        open: false,
        message: "",
    });

    const handleShowSnackbar = (message) => {
        setShowSnackbar({
            open: true,
            message: message,
        });
    }

    const handleCloseSnackbar = () => {
        setShowSnackbar({
            open: false,
            message: "",
        });
    }

    useEffect(() => {
        handleGetAllBookedTicket();
        setMounted(true);
        setTimeout(() => {
            setIsLoading(false);
        }, 500);
    }, []);

    const handleGetAllBookedTicket = async () => {
        setIsLoading(true);
        const response = await axios.post(`/api/get-all-booked-ticket`, {
            email: user?.email,
        });
        console.log("response :: ", response.data.data);
        // setIsLoading(false);
        // {
        //     "total_tickets": [
        //         1,
        //         2,
        //         3,
        //         4,
        //         5
        //     ],
        //         "booked_by_user": [
        //             1,
        //             2,
        //             3,
        //             4,
        //             5
        //         ]
        // }
        // return;
        const { total_tickets, booked_by_user } = response.data.data.data;
        handleMarkInASingleRowSeatAsBooked(total_tickets, total_tickets.length);
        setUserTickets(booked_by_user);
        setTimeout(() => {
            setIsLoading(false);
        }, 500);
    }

    const handleSeatClick = (seatNumber) => {
        if (seatStatus[seatNumber - 1].isBooked) return;
        if (selectedSeats.includes(seatNumber)) {
            setSelectedSeats(prev => prev.filter(seat => seat !== seatNumber));
        } else if (selectedSeats.length < 7) {
            setSelectedSeats(prev => [...prev, seatNumber]);
        }
    };


    const handleBookingAPI = async (ticketIDs) => {
        const response = await axios.post(`/api/book-tickets`, {
            email: user?.email,
            ticketIDs,
        });
        return response.data.data;
    }

    const handleBookTickets = async () => {
        console.log("numSeats :: ", numSeats);
        if (numSeats === 0 || numSeats > 7 || !numSeats) {
            setShowSnackbar({
                open: true,
                message: "Please enter a valid number of seats between 1 and 7",
            });
            return;
        }
        const allocateSeats = handleSingleRowSeatAllocation(numSeats);
        if (allocateSeats.length > 0) {
            const ticketIDs = ticketToBeBooked(allocateSeats, numSeats);
            setIsBooking(true);
            const bookingStatus = await handleBookingAPI(ticketIDs);
            console.log("bookingStatus :: ", bookingStatus);
            setUserTickets([...userTickets, ...ticketIDs]);
            handleMarkInASingleRowSeatAsBooked(allocateSeats, numSeats);
            setIsBooking(false);
            setShowSnackbar({
                open: true,
                message: "Tickets booked successfully",
            });
        }
        else {
            const allocateMultipleRowSeats = handleMultipleRowSeatAllocation(numSeats);
            if (allocateMultipleRowSeats.length > 0) {
                const ticketIDs = ticketToBeBooked(allocateMultipleRowSeats, numSeats);
                setIsBooking(true);
                const bookingStatus = await handleBookingAPI(ticketIDs);
                if (bookingStatus.status === "201" && bookingStatus.message === "BOOKED_SUCCESSFULLY") {
                    setUserTickets([...userTickets, ...ticketIDs]);
                    handleMarkInASingleRowSeatAsBooked(allocateMultipleRowSeats, numSeats);
                }
                setIsBooking(false);
                setShowSnackbar({
                    open: true,
                    message: "Tickets booked successfully",
                });
            } else {
                setShowSnackbar({
                    open: true,
                    message: "Entered seats are not available",
                });
            }
        }
    };

    const handleMarkInASingleRowSeatAsBooked = (allocateSeats, numSeats) => {
        let ticketData = [];
        setSeatStatus(
            seatStatus.map(row => row.map(seat => {
                if (allocateSeats.includes(seat.seatNumber)) {
                    numSeats--;
                    if (numSeats < 0) {
                        return { ...seat, isBooked: false, bookedBy: null };
                    }
                    ticketData.push(seat.seatNumber);
                    return { ...seat, isBooked: true, bookedBy: user?.email };
                }
                return seat;
            }))
        );
        return ticketData;
    }

    const ticketToBeBooked = (allocateSeats, numSeats) => {
        let ticketData = seatStatus;
        let ticketIDs = [];
        ticketData.map(row => row.map(seat => {
            if (allocateSeats.includes(seat.seatNumber)) {
                numSeats--;
                if (numSeats < 0) {
                    return { ...seat, isBooked: false, bookedBy: null };
                }
                ticketIDs.push(seat.seatNumber);
                return { ...seat, isBooked: true, bookedBy: user?.email };
            }
            return seat;
        }))
        return ticketIDs;
    }

    const handleSingleRowSeatAllocation = (numSeats) => {
        let rowWiseAvailableSeat = seatStatus.map(row => row.filter(seat => !seat.isBooked).map(seat => seat.seatNumber));
        for (let i = 0; i < rowWiseAvailableSeat.length; i++) {
            if (rowWiseAvailableSeat[i].length >= numSeats) {
                return rowWiseAvailableSeat[i].slice(0, numSeats);
            }
        }
        return [];
    }

    const handleMultipleRowSeatAllocation = (numSeats) => {
        let rowWiseAvailableSeat = seatStatus.map(row => row.filter(seat => !seat.isBooked).map(seat => seat.seatNumber));
        console.log("rowWiseAvailableSeat :: ", rowWiseAvailableSeat);
        let availableSeats = [];
        for (let i = 0; i < rowWiseAvailableSeat.length; i++) {
            availableSeats = [...availableSeats, ...rowWiseAvailableSeat[i]];
        }
        if (availableSeats.length >= numSeats) {
            return availableSeats.slice(0, numSeats);
        }
        return [];
    }

    if (!mounted) return null;
    if (isLoading) {
        return <div><CircularProgress /></div>;
    }


    const handleCancelTicket = async () => {
        if (userTickets.length === 0) {
            setShowSnackbar({
                open: true,
                message: "No tickets to cancel",
            });
            return;
        }

        setIsBooking(true);
        const response = await axios.post(`/api/cancel-ticket`, {
            email: user?.email,
        });

        handleUnmarkTicketsWhenCancel(userTickets);
        setIsBooking(false);
        setShowSnackbar({
            open: true,
            message: "Tickets cancelled successfully",
        });
    }

    const handleUnmarkTicketsWhenCancel = (userTickets) => {
        setSeatStatus(
            seatStatus.map(row => row.map(seat => {
                if (userTickets.includes(seat.seatNumber)) {
                    return { ...seat, isBooked: false, bookedBy: null };
                }
                return seat;
            }))
        );
        setUserTickets([]);
    }

    const action = (
        <React.Fragment>
            <IconButton
                size="small"
                aria-label="close"
                color="inherit"
                onClick={handleCloseSnackbar}
            >
                <CloseIcon fontSize="small" />
            </IconButton>
        </React.Fragment>
    );


    return (
        <div className="wagon-container">
            <div className="wagon">
                {seatStatus.map((row, rowIndex) => (
                    <div key={rowIndex} className={`seat-row ${rowIndex === 10 ? 'last-row' : ''}`}>
                        {row.map((seat, seatIndex) => (
                            <div
                                key={seatIndex}
                                className={`seat ${seat.isBooked ? 'booked' : ''} ${selectedSeats.includes(seat.seatNumber) ? 'selected' : ''}`}
                                data-seat-number={seat.seatNumber}
                                onClick={() => {

                                }}
                            >
                                {seat.seatNumber}
                            </div>
                        ))}
                    </div>
                ))}
            </div>
            <div className="book-ticket-container">
                <div className="user-info">
                    <div className="tickets">
                        <p>Total Tickets Booked : {userTickets.length}</p>
                        <p>Your Tickets : {userTickets.map(ticket => ticket)}</p>
                        <p>Available Tickets : {seatStatus.reduce((total, row) =>
                            total + row.filter(seat => !seat.isBooked).length, 0
                        )}</p>
                    </div>
                </div>
                <BookTicketsPanel
                    numSeats={numSeats}
                    setNumSeats={setNumSeats}
                    isBooking={isBooking}
                    handleBookTickets={handleBookTickets}
                    handleCancelTicket={handleCancelTicket}
                    userTickets={userTickets}
                    isCancelling={isBooking}
                    setShowSnackbar={setShowSnackbar}
                />
            </div>
            <Snackbar
                open={showSnackbar.open}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                message={showSnackbar.message}
                action={action}
            />
        </div >
    )
}