import { React, useState } from 'react';
import './App.css';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout, CentralContainer, History, Tests, Docs, ActiveTests, Results } from './components/index';

const App = () => {
  const [tests, setTests] = useState(null);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<CentralContainer testList={tests} setTestList={setTests} />} />
          <Route path="history/" element={<History testList={tests} setTestList={setTests} URL="/" />} />
          <Route path="tests/:id" element={<Tests />}>
          </Route>
          <Route path="tests/:id/results" element={<Results />} />
          <Route path="docs/" element={<Docs />} />
          <Route path="activeTests/" element={<ActiveTests testList={tests} setTestList={setTests} URL={["/?status=In+queue","/?status=Running"]} />} />
          <Route
            path="*"
            element={
              <main style={{ padding: "1rem" }}>
                <p>Unkonwn path: There's nothing here!</p>
              </main>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App