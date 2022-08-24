import React, { useState } from 'react';
import axios from 'axios';
import { Row, Col, Form, Button, FormGroup } from 'react-bootstrap';
import { RiArrowUpDownFill } from "react-icons/ri";
const FormData = require('form-data');
// import Alert from "./alert";

const inputFileList = require("../assets/inputFileList.json");
const CreateTest = (props) => {
    const [formdata, setFormdata] = useState({
        rps: '',
        time: '',
        users: '',
        testName: '',
        createdBy: '',
        input: '',
        env: '',
        langFeature: '',
        inputFileChar: '',
        customFile: null
    });
    const [isCustom, setCustom] = useState(inputFileList[formdata.langFeature] ? inputFileList[formdata.langFeature] : false);
    const [isDisabled, setDisabled] = useState(false);
    // const [isDisplayed, setDisplayed] = useState(false);
    // const [message, setMessage] = useState(null);
    const handleReset = () => {
        setFormdata({
            rps: '',
            time: '',
            users: '',
            testName: '',
            createdBy: '',
            input: '',
            env: '',
            langFeature: '',
            inputFileChar: '',
            customFile: null
        });
    };
    const handleChange = (event) => {
        const newData = { ...formdata };
        newData[event.target.id] = event.target.value;
        if (event.target.id === "rps") {
            newData.users = event.target.value * 2
        }
        else if (event.target.id === "langFeature") {
            setCustom(inputFileList[event.target.value].isCustom);
            // console.log("isCustom: "+inputFileList[event.target.value].isCustom)
        }
        console.log("changed " + event.target.id + " = " + event.target.value)
        setFormdata(newData);
    }
    function handleSubmit(event) {
        event.preventDefault();
        const newTest = {
            ...formdata
        };
        if(!isDisabled){
            console.log("file input Disbaled");
            newTest.customFile = null;
        }
        const formData = new FormData();
        for (const [key, value] of Object.entries(newTest)) {
            formData.append(key, value);
        }
        // console.log(newTest);
        axios.post(`http://localhost:3001/api/tests/`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        }).then((res) => {
            switch (res.status) {
                case 500: alert("Response:\n" + res.data.error + ": Could not process request"); break;
                case 503:
                case 504: alert("Response:\n" + res.data.error + ": Please try again later"); break;
                case 202: alert("Response: Test submitted"); break;
                default: alert("Response:\n" + res.data.toString()); break;
            }
        }).catch((err) => {
                alert(err + "\nCould not send request.");
            })
        props.onFormsubmit();
        handleReset();
    }
    function loadLangFeatures(inputList) {
        return <>
            {
                Object.entries(inputList).map((pair, idx) => (<option key={idx} value={pair[0]}>{pair[1].name}</option>))
            }
        </>
    }
    function loadInputFileList(inputList, langFeature, chars) {
        if (langFeature === "") {
            return <></>
        }
        if (chars === "") {
            return <></>
        }
        return <>
            {
                inputList[langFeature].fileList[chars].map((file, idx) => (<option key={idx} value={file.value}>{file.option}</option>))
            }
        </>
    }
    function loadCharList(inputList, langFeature) {
        if (langFeature === "") {
            return <></>
        }
        return <>
            {
                Object.keys(inputList[langFeature].fileList).map((char, idx) => (<option key={idx} value={char}>{char} chars</option>))
            }
        </>
    }
    function disableInput(event) {
        const newData = { ...formdata };
        newData.input = event.target.files[0].name;
        newData.inputFileChar = "";
        newData.customFile = event.target.files[0];
        console.log("changed input to " + event.target.value);
        console.log("changed customFile to " + event.target.files[0]);
        setFormdata(newData);
        setDisabled(true);
    }

    return (
        <>
            <Form onSubmit={handleSubmit} formdata={formdata}>
                <Row className="mb-3">
                    <Form.Group as={Col} controlId="testName">
                        <Form.Label>Test Name</Form.Label>
                        <Form.Control type="text" placeholder='e.g. Test01' value={formdata.testName} onChange={handleChange} />
                    </Form.Group>

                    <Form.Group as={Col} controlId="createdBy">
                        <Form.Label>Created By</Form.Label>
                        <Form.Control type="text" placeholder="Enter your GUID" value={formdata.createdBy} onChange={handleChange} />
                    </Form.Group>
                </Row>
                <Row className="mb-3">
                    <Form.Group as={Col} controlId="env" >
                        <Form.Label>Environment</Form.Label>
                        <Form.Select value={formdata.env} onChange={handleChange} required={true}>
                            <option value="">Select here</option>
                            <option value="int">Integration</option>
                            <option value="preprod">Pre-Production</option>
                        </Form.Select>
                        <Form.Text className="text-muted">
                            Choose Environment
                        </Form.Text>
                    </Form.Group>
                    <Form.Group as={Col} controlId="langFeature" >
                        <Form.Label>Language Feature</Form.Label>
                        <Form.Select value={formdata.langFeature} onChange={handleChange} required={true}>
                            <option value="">Select here</option>
                            {loadLangFeatures(inputFileList)}
                        </Form.Select>
                        <Form.Text className="text-muted">
                            Choose the model to be tested
                        </Form.Text>
                    </Form.Group>
                </Row>
                <Row className="mb-3">
                    <Form.Group as={Col} controlId="rps">
                        <Form.Label>Requests per second</Form.Label>
                        <Form.Control type="text" placeholder="Enter rps" value={formdata.rps} onChange={handleChange} required={true}/>
                        <Form.Text className="text-muted">
                            The number of requests to be made to the service per second.
                        </Form.Text>
                    </Form.Group>
                    <Form.Group as={Col} controlId="time">
                        <Form.Label>Time</Form.Label>
                        <Form.Control type="text" placeholder="Enter duration" value={formdata.time} onChange={handleChange} required={true}/>
                        <Form.Text className="text-muted">
                            The duration of simulation in mins.
                        </Form.Text>
                    </Form.Group>
                </Row>
                <Row className="mb-3">
                    {!isCustom &&
                        <Form.Group as={Col} controlId="users">
                            <Form.Label>Users</Form.Label>
                            <Form.Control type="text" placeholder="Preferably 1.5 times RPS" value={formdata.users} defaultValue={Math.ceil(formdata.rps * 1.5)} onChange={handleChange} required={true}/>
                            <Form.Text className="text-muted">
                                The number of users sending to simulate.
                            </Form.Text>
                        </Form.Group>
                    }
                    <FormGroup as={Col} >
                        <Form.Label>Input File</Form.Label>
                        <Row className='mb-3'>
                            <Col>
                                <Form.Select value={formdata.inputFileChar} id="inputFileChar" onChange={handleChange} disabled={isDisabled && isCustom} placeholder="Select character length of test document" required={true}>
                                    <option value="">Select here</option>
                                    {loadCharList(inputFileList, formdata.langFeature)}
                                </Form.Select>
                            </Col>
                            <Col>
                                <Form.Select value={formdata.input} id="input" onChange={handleChange} disabled={isDisabled && isCustom} placeholder="Select Input File" required={true}>
                                    <option value="">Select here</option>
                                    {loadInputFileList(inputFileList, formdata.langFeature, formdata.inputFileChar)}
                                </Form.Select>
                            </Col>
                        </Row>
                        <Row id="interchangeRow" className={isCustom ? 'd-flex' : 'd-none'}>
                            <Button variant="outline-dark" className="shadow-none rounded-circle w-auto m-auto" onClick={() => { setDisabled(!isDisabled) }}><RiArrowUpDownFill /></Button>
                        </Row>
                        <Row>
                            {isCustom &&
                                <Col>
                                    <Form.Label>Upload Custom JSON</Form.Label>
                                    <Form.Control type="file" id="upload" accept=".json, application/json" onChange={disableInput} disabled={!isDisabled} required={true} />
                                </Col>
                            }
                        </Row>
                    </FormGroup>
                </Row>
                <Row className="px-4 mb-1 flex-row-reverse justify-content-center">
                    <Button type="submit" className="btn btn-primary col-2 rounded-pill">Submit</Button>
                </Row>
            </Form>
            {/* {isDisplayed && <div className='overlay d-flex justify-content-center align-items-center'>
            <Alert type="error" close={()=>setDisplayed(false)} message={message}/>
        </div>} */}
        </>
    );
}
export default CreateTest;
