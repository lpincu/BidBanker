import './style.css';


const PendingBids = ({bids}) => {

  return (
    <div>
      <span className="table_title">Pending Bids</span>
      <table className="table">
        <thead>
        <tr>
          <th>Bid ID</th>
          <th>Bid Time</th>
          <th>Bid Price</th>
        </tr>
        </thead>
        <tbody>
        {bids.map(bid => {
          return (
            <tr key={bid.id}>
              <td>{bid.id}</td>
              <td>{bid.time}</td>
              <td>{`${bid.price}$`}</td>
            </tr>
          )
        })}
        </tbody>
      </table>
    </div>
  )

}

export default PendingBids