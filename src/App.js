import React, {useCallback, useMemo, useRef} from 'react';
import {AgGridReact} from '@ag-grid-community/react';
import '@ag-grid-community/styles/ag-grid.css';
import '@ag-grid-community/styles/ag-theme-alpine.css';
import {ModuleRegistry} from '@ag-grid-community/core';
import {ServerSideRowModelModule} from '@ag-grid-enterprise/server-side-row-model';

// Register the required feature modules with the Grid
ModuleRegistry.registerModules([
    ServerSideRowModelModule
]);

export const createServerSideDatasource = (server) => {
    return {
        getRows: (params) => {
            console.log('[Datasource] - rows requested by grid: ', params.request);
            // get data for request from our fake server
            var response = server.getData(params.request);
            // simulating real server call with a 500ms delay
            setTimeout(function () {
                if (response.success) {
                    // supply rows for requested block to grid
                    params.success({rowData: response.rows});
                } else {
                    params.fail();
                }
            }, 500);
        },
    };
};

export const createFakeServer = (allData) => {
    return {
        getData: (request) => {
            // take a copy of the data to return to the client
            var requestedRows = allData.slice();
            return {
                success: true,
                rows: requestedRows,
            };
        },
    };
};

const App = props => {
    const containerStyle = useMemo(() => ({width: '100%', height: '100%'}), []);
    const gridStyle = useMemo(() => ({height: '100%', width: '100%'}), []);

    const gridRef = useRef();

    const columnDefs = useMemo(() => [
        {field: 'athlete', minWidth: 220},
        {field: 'country', minWidth: 200},
        {field: 'year'},
        {field: 'sport', minWidth: 200},
        {field: 'gold'},
        {field: 'silver'},
        {field: 'bronze'},
    ], []);

    const defaultColDef = useMemo(() => {
        return {
            flex: 1,
            minWidth: 100,
        };
    }, []);

    const onGridReady = useCallback((params) => {
        fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
            .then((resp) => resp.json())
            .then((data) => {
                // setup the fake server with entire dataset
                var fakeServer = createFakeServer(data);
                // create datasource with a reference to the fake server
                var datasource = createServerSideDatasource(fakeServer);
                // register the datasource with the grid
                params.api.setServerSideDatasource(datasource);
            });
    }, []);

    const onGridReadyToUse = props.onGridReady || onGridReady;
    const onFirstDataRendered = props.onFirstDataRendered || (() => {});

    return (
        <div style={containerStyle}>
            <div style={gridStyle} className="ag-theme-alpine-dark">
                <AgGridReact
                    ref={gridRef}
                    columnDefs={columnDefs}
                    defaultColDef={defaultColDef}
                    rowModelType={'serverSide'}
                    onGridReady={onGridReadyToUse}
                    onFirstDataRendered={onFirstDataRendered}
                ></AgGridReact>
            </div>
        </div>
    );
};

export default App;
