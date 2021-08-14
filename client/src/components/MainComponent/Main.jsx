import React, { useCallback, useEffect, useState } from 'react'
import './style.css';
import { Dropdown } from 'reactjs-dropdown-component';
import axios from 'axios';
import PendingBids from '../PendingBids/PendingBids'
import { io } from 'socket.io-client';


const BASE_PATH = 'http://localhost'
const axiosInstance = axios.create({
  baseURL: `${BASE_PATH}:8000/`,
  params: {
  },
});

const Main = () => {

  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState('');
  const [bids, setBids] = useState([])
  const [socket, setSocket] = useState();

  useEffect(() => {
    getCampaigns().then( fetchedCampaigns => {
      setCampaigns(fetchedCampaigns.data.map(campaign => ({ value: campaign, label: campaign })));
    })
  },[])

  const handleBid = (newBid) => {
    if (!newBid.status) {
      setBids((prevBids) => { // Anonymous function inside setter to ensure that the the most updated data is held
        return [...prevBids, { ...newBid }];
      });
    } else {
      setBids((prevBids) => {
        return prevBids.filter(bid => newBid.id !== bid.id); // if status != 0 bid is not pending anymore
      });
    }
  };


  useEffect(() => {
    const currentSocket = io(`${BASE_PATH}:8080`, { transport: ['websocket'] }); // save socket id to close when component rerender
    setSocket(currentSocket);
    return () => currentSocket.disconnect();
  }, [])

  const onChange = (item) => {
    setSelectedCampaign(item.value)
    socket.on(item.value, (...args) => { // change the the "room" that the socket is listen to
      handleBid(args[0]); //args[0] === bidData
    })
    setBids([])
  }

  async function getCampaigns() {
    return await axiosInstance.get('getAllCampaigns');
  }
  return (
    <div>
      <div className="title">
        <p>BigaBid Banker</p>
      </div>
      <div className="dropdown_wrapper">
        <Dropdown
          name="location"
          title="Select location"
          list={campaigns}
          onChange={onChange}
          styles={{
            wrapper: { fontSize: '20px' }
          }}
        />
      </div>
      <div className="lower_section">
        <PendingBids bids={bids} />
      </div>
    </div>
  )
}

export default Main