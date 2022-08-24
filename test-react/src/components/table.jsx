import React, { useMemo } from 'react';
import { Link } from "react-router-dom";
import './components.css';
import { useTable, usePagination } from 'react-table';
import { useState } from 'react';

const ColoredCircle = ({ status }) => {

    let getColor = (status) => {
        switch (status) {
            case 'Error':
                return "red";
            case 'In queue':
                return "yellow";
            case 'Running':
                return "orange";
            case 'Completed':
                return "green";
            default:
                return "black";
        }
    }

    const styles = {
        backgroundColor: getColor(status)
    };

    return status ? (
        <React.Fragment>
            <span className="colored-circle " style={styles} />
            <span>  </span>
        </React.Fragment>
    ) : null;
};

const Table = (props) => {
    const [pageInd, setPageInd] = useState(0); 
    const columns = useMemo(
        () => [
            {
                Header: "#",
                accessor: "id",
                Cell: (props) => {
                    return (
                        <>
                            {props.row.index + 1}
                        </>
                    );
                }
            },
            {
                Header: "Test Name",
                accessor: "testName",
                Cell: (props) => {
                    if(props.row.original.status!="Completed" && props.row.original.status!="Error"){
                        return (
                            <>
                            {props.value}
                            </>
                        );
                    }else{
                        return (
                            <Link to={{ pathname: "/tests/" + props.row.original._id }}>
                                {props.value}
                            </Link>
                        );
                    }
                }
            },
            {
                Header: "Status",
                accessor: "status",
                Cell: (props) => {
                    return (
                        <>
                            <ColoredCircle status={props.value} />
                            {props.value}
                        </>
                    );
                }
            },
            {
                Header: "Created On",
                accessor: "createdAt",
                Cell: (props) => {
                    let dateIST = new Date(props.value).toLocaleString("en-UK", {timeZone: 'Asia/Kolkata', hour12: true});
                    return (
                        <>
                            {dateIST}
                        </>
                    );
                }
            },
            {
                Header: "Created By",
                accessor: "createdBy"
            }
        ],
        []
    );
    const data = props.testSearchList;
    const tableInstance = useTable({
        columns,
        data,
        initialState: { pageIndex: pageInd, pageSize: 10 },
    },
        usePagination
    );
    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        prepareRow,
        page,
        canPreviousPage,
        canNextPage,
        pageOptions,
        pageCount,
        gotoPage,
        nextPage,
        previousPage,
        setPageSize,
        state: { pageIndex, pageSize },
    } = tableInstance;

    return (
        <div className="table-responsive table-border-shadow bg-white p-2 mb-2 ">
            <table {...getTableProps()} className="table table-hover">
                <thead>
                    {headerGroups.map(headerGroup => (
                        <tr {...headerGroup.getHeaderGroupProps()}>
                            {headerGroup.headers.map(column => (
                                <th {...column.getHeaderProps()}>{column.render('Header')}</th>
                            ))}
                        </tr>
                    ))}
                </thead>
                <tbody {...getTableBodyProps()}>
                    {page.map((row, i) => {
                        prepareRow(row)
                        return (
                            <tr {...row.getRowProps()}>
                                {row.cells.map(cell => {
                                    // console.log(cell);
                                    return <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                                })}
                            </tr>
                        )
                    })}
                </tbody>
            </table>
            {
                // Navigation options for table
                props.showPagination &&
                <ul className="pagination d-flex mb-1 ">

                    <li className="">
                        <strong>
                            Showing Page {pageIndex + 1} of {pageOptions.length}
                        </strong>
                    </li>
                    <li className="page-item ms-auto" onClick={() => {gotoPage(0); setPageInd(0)}} disabled={!canPreviousPage}>
                        <div className="page-link rounded-start">{"<<"}</div>
                    </li>
                    <li className="page-item" onClick={() => {previousPage(); setPageInd(pageIndex-1)}} disabled={!canPreviousPage}>
                        <a className="page-link">{'<'}</a>
                    </li>
                    <li className="page-item">
                        <a className="page-link">
                            <input
                                value={pageIndex + 1}
                                onChange={e => {
                                    const page = e.target.value ? Number(e.target.value) - 1 : 0
                                    gotoPage(page);
                                    setPageInd(page)
                                }}
                                style={{ height: '1rem', border: 'none', width: '2rem', textAlign: 'center' }}
                            />
                        </a>
                    </li>
                    <li className="page-item" onClick={() =>{ nextPage(); setPageInd(pageIndex+1)}} disabled={!canNextPage}>
                        <a className="page-link">{'>'}</a>
                    </li>
                    <li className="page-item" onClick={() => {gotoPage(pageCount - 1); setPageInd(pageCount-1)}} disabled={!canNextPage}>
                        <a className="page-link rounded-end">{">>"}</a>
                    </li>
                </ul>
            }
        </div >
    )
}

export default Table