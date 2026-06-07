//Import useState and useEffect from React
//useState allows storing and updating data inside the component. 
//useEffect allows us to run code when the component loads, which is good for fetching data

import { useState, useEffect } from 'react'

function OrdersTable()
{
    //--State 
    //orders holds the array of orders fetched from the API
    //Starts as an empty array, before the fetch completes there are no orders to show
    const [orders, setOrders] = useState([])

    //loading tracks whether data is being fetched 
    //Used to show a loading message while the request is flying
    const [loading, setLoading] = useState(true)

    //error holds any error message should the fetch fail
    //Used to show a helpful message instead of silently failing.
    const [error, setError] = useState(null)

    //--Filter and sort state
    //customerIdFilter holds the value of the filter input field
    const [customerIdFilter, setCustomerIdFilter] = useState('')

    //sortBy holds which column we are currently sorting by
    const [sortBy, setSortBy] = useState('orderId')

    //sortOrder holds the current sort direction, asc or desc
    const [sortOrder, setSortOrder] = useState('asc')

    //-- Pagination State
    //currentPage tracks which page we are on
    const [currentPage, setCurrentPage] = useState(1)

    //How many orders to show per page, fixed at 5
    const LIMIT = 5

    //--Data fetching
    //useEffect runs this function every time one of the dependencies in the array changes.
    //dependency being everything that can change what data is being fetched
    //when any of them change, automatically re-fetch with the new parameters. 
    useEffect(() =>
    {
        //Reset to page 1 whenever the filter or sort changes.
        //preventing being on page 3 when filtered result only has 1 page.
        setCurrentPage(1)

    }, [customerIdFilter, sortBy, sortOrder])

    useEffect(() =>
    {
        //Mark loading as true before the fetch starts
        setLoading(true)
        setError(null)

        //Build the query string from current state
        //Only add params that have values.
        const params = new URLSearchParams()
        params.append('page', currentPage)
        params.append('limit', LIMIT)
        params.append('sortBy', sortBy)
        params.append('order', sortOrder)

        //Only add customerId filter if the user has typed something.
        if (customerIdFilter.trim())
        {
            params.append('customerId', customerIdFilter.trim())
        }

        //Fetching orders from the backend via the Vite proxy
        // /api/orders gets forwarded to localhost:3000/api/orders automatically
        fetch(`/api/orders?${params.toString()}`)
            .then(res =>
            {
                //if the response is not ok throw an error
                if (!res.ok) throw new Error('Failed to fetch orders')
                return res.json()
            })
            .then(data =>
            {
                //store the fetched orders in state
                setOrders(data)
                setLoading(false)
            })
            .catch(err =>
            {
                //Store the error message in state so we can display it
                setError(err.message)
                setLoading(false)
            })
    }, [currentPage, sortBy, sortOrder, customerIdFilter])

    //Sort Handler
    //Called when the user clicks a column header. 
    //If clicking the same column, toggle the direction.
    //If clicking a new column, set it as the sort column with asc direction. 
    const handleSort = (column) =>
    {
        if (sortBy === column)
        {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
        }
        else
        {
            setSortBy(column)
            setSortOrder('asc')
        }
    }

    //Helper to show a sort indicator arrow next to the active sort column
    const getSortIndicator = (column) =>
    {
        if (sortBy !== column) return '↕'
        return sortOrder === 'asc' ? '↑' : '↓'
    }

    //--Render
    return (
        <div style={styles.container}>
            <h1 style={styles.heading}>Orders</h1>

            {/* Filter Controls */}
            <div style={styles.controls}>
                <input
                    style={styles.input}
                    type="text"
                    placeholder="Filter by Customer ID (e.g. CUST-1)"
                    value={customerIdFilter}
                    //Update filter state as the user types
                    onChange={e => setCustomerIdFilter(e.target.value)}
                />
            </div>

            {/* Loading State */}
            {loading && (
                <p style={styles.message}>Loading orders...</p>
            )}

            {/* Error State */}
            {error && (
                <p style={styles.error}>Error: {error}</p>
            )}

            {/* Empty State */}
            {!loading && !error && orders.length === 0 && (
                <p style={styles.message}>No orders found.</p>
            )}

            {/* Orders Table */}
            {!loading && !error && orders.length > 0 && (
                <table style={styles.table}>
                    <thead>
                        <tr>
                            {/* Clicking any header sorts by that column */}
                            <th style={styles.th} onClick={() => handleSort('orderId')}>
                                Order ID {getSortIndicator('orderId')}
                            </th>
                            <th style={styles.th} onClick={() => handleSort('customerId')}>
                                Customer ID {getSortIndicator('customerId')}
                            </th>
                            <th style={styles.th} onClick={() => handleSort('item')}>
                                Item {getSortIndicator('item')}
                            </th>
                            <th style={styles.th} onClick={() => handleSort('quantity')}>
                                Quantity {getSortIndicator('quantity')}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* Map over orders array and render a row for each order */}
                        {orders.map(order => (
                            <tr key={order.orderId} style={styles.tr}>
                                <td style={styles.td}>{order.orderId}</td>
                                <td style={styles.td}>{order.customerId}</td>
                                <td style={styles.td}>{order.item}</td>
                                <td style={styles.td}>{order.quantity}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {/* Pagination Controls */}
            {!loading && !error && (
                <div style={styles.pagination}>
                    {/* Disable previous button on first page */}
                    <button
                        style={styles.button}
                        onClick={() => setCurrentPage(p => p - 1)}
                        disabled={currentPage === 1}
                    >
                        Previous
                    </button>

                    <span style={styles.pageInfo}>Page {currentPage}</span>

                    {/* Disable next button when fewer results than limit means we are on the last page */}
                    <button
                        style={styles.button}
                        onClick={() => setCurrentPage(p => p + 1)}
                        disabled={orders.length < LIMIT}
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    )
}

// ── Styles
// Inline styles keep everything in one file, no separate CSS file needed
// This is intentional for a lightweight project like this
const styles =
{
    container:
    {
        maxWidth: '900px',
        margin: '0 auto',
        backgroundColor: '#fff',
        borderRadius: '8px',
        padding: '2rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    },
    heading:
    {
        marginBottom: '1.5rem',
        fontSize: '1.8rem',
        color: '#222'
    },
    controls:
    {
        marginBottom: '1.5rem'
    },
    input:
    {
        padding: '0.5rem 1rem',
        fontSize: '0.95rem',
        border: '1px solid #ccc',
        borderRadius: '4px',
        width: '300px'
    },
    table:
    {
        width: '100%',
        borderCollapse: 'collapse',
        marginBottom: '1.5rem'
    },
    th:
    {
        textAlign: 'left',
        padding: '0.75rem 1rem',
        backgroundColor: '#f0f0f0',
        borderBottom: '2px solid #ddd',
        cursor: 'pointer',
        userSelect: 'none',
        fontSize: '0.9rem',
        fontWeight: '600'
    },
    td:
    {
        padding: '0.75rem 1rem',
        borderBottom: '1px solid #eee',
        fontSize: '0.9rem'
    },
    tr:
    {
        transition: 'background-color 0.15s'
    },
    pagination:
    {
        display: 'flex',
        alignItems: 'center',
        gap: '1rem'
    },
    button:
    {
        padding: '0.5rem 1rem',
        fontSize: '0.9rem',
        border: '1px solid #ccc',
        borderRadius: '4px',
        cursor: 'pointer',
        backgroundColor: '#fff'
    },
    pageInfo:
    {
        fontSize: '0.9rem',
        color: '#555'
    },
    message:
    {
        color: '#555',
        fontSize: '0.95rem',
        marginBottom: '1rem'
    },
    error:
    {
        color: '#c0392b',
        fontSize: '0.95rem',
        marginBottom: '1rem'
    }
}

export default OrdersTable