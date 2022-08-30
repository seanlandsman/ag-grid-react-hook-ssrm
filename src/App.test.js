import {render, screen, waitFor} from '@testing-library/react';
import App, {createFakeServer, createServerSideDatasource} from './App';
import {act} from 'react-dom/test-utils';

test('renders learn react link', async () => {
    let params = null;
    let firstDataRendered = false;

    const onGridReady = (gridReadyParams) => {
        params = gridReadyParams;
    };

    const onFirstDataRendered = (e) => {
        firstDataRendered = true;
    }

    act(() => {
        render(<App
            onGridReady={onGridReady}
            onFirstDataRendered={onFirstDataRendered}
        />)
    });

    await waitFor(() => expect(params).toBeTruthy());

    const response = await fetch('https://www.ag-grid.com/example-assets/olympic-winners.json');
    const rowData = await response.json();

    act(() => {
        // setup the fake server with entire dataset
        var fakeServer = createFakeServer(rowData);
        // create datasource with a reference to the fake server
        var datasource = createServerSideDatasource(fakeServer);
        // register the datasource with the grid
        params.api.setServerSideDatasource(datasource);
    })

    await waitFor(() => expect(firstDataRendered).toBeTruthy());

    const actionsColumns = screen.queryAllByText("Swimming");
    expect(actionsColumns.length).toBeGreaterThan(5); // some arbitrary test here for demonstration purposes
});
