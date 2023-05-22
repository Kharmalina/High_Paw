import { useContext, useEffect, useState } from "react";
import SmallMap from "./SmallMap";
import { Link } from "react-router-dom";
import { UserContext } from "../App";
import ReactPaginate from "react-paginate";

function Hangouts() {
  const [searchTerm, setSearchTerm] = useState("");
  const [hangouts, setHangouts] = useState([]);
  const [filteredHangouts, setFilteredHangouts] = useState([]);
  const [allUsers, setAllUsers] = useState({});
  const { user } = useContext(UserContext);

  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 2; // Change this value to the desired number of items per page

  // useEffect(() => {
  // if user is null, redirect to login page
  // delete later
  if (!user) {
    window.location.href = "/mainpage";
  }
  // }, [user]);
  // get user name for a userId
  const getUserName = async (id) => {
    const response = await fetch(
      `https://high-paw-production.up.railway.app/profile/${id}`,
      {
        headers: {
          Authorization: `Bearer ${user.accessToken}`,
        },
      }
    );
    const data = await response.json();
    // set users by spreading all prev users and adding the new user by key
    setAllUsers((prev) => {
      return { ...prev, [id]: data.name };
    });
  };

  useEffect(() => {
    const getHangouts = async () => {
      const response = await fetch(
        `https://high-paw-production.up.railway.app/hangout/all`,
        {
          headers: {
            Authorization: `Bearer ${user.accessToken}`,
          },
        }
      );
      const data = await response.json();
      setHangouts(data.hangouts);
      setFilteredHangouts(data.hangouts);
      const users = [];

      for (let hangout of data.hangouts) {
        users.push(hangout.userId);
      }
      console.log(users);
      // remove duplicates
      const uniqueUsers = [...new Set(users)];
      console.log(uniqueUsers);

      for (let userId of uniqueUsers) {
        getUserName(userId);
      }
    };
    getHangouts(); // Call the getHangouts function to fetch the hangouts data
  }, []);

  const handlePageChange = (selectedPage) => {
    setCurrentPage(selectedPage.selected);
  };

  useEffect(() => {
    // filter hangouts by user name
    const filteredHangouts = hangouts.filter((hangout) => {
      for (let user in allUsers) {
        if (searchTerm === "") return hangout;

        if (allUsers[user].toLowerCase().includes(searchTerm.toLowerCase())) {
          return hangout.userId === user;
        }
      }
    });
    setFilteredHangouts(filteredHangouts);
  }, [searchTerm]);
  return (
    <div className="parent-container w-screen">
      <div className="search flex justify-center">
        <input
          type="text"
          placeholder="Search hangouts by user..."
          className=" w-8/12 border rounded-md px-4 py-2 mt-10 focus:outline-green-500 transition text-xs shadow-md cursor-pointer hover:border-green-400"
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      {filteredHangouts
        .slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage)
        // needs to be fixed
        // filter by user name to show hangouts created by that user

        .map((hangout, index) => (
          <div
            className={` shadow-md w-8/12 h-52 bg-white rounded-md m-auto mt-16 flex justify-between  border-l-2 border-t border-green-500 ${
              index % 2 === 0 ? "flex-row-reverse" : "flex-row"
            }`}
            key={hangout._id}
          >
            <div className="hangout  w-3/4 px-6 ">
              <Link to={`/hangout/${hangout._id}`}>
                <h2 className="title text-3xl text-stone-700 underline mb-6">
                  {hangout.title}
                </h2>
              </Link>
              <p className="description text-stone-600 text-sm">
                {hangout.description}
              </p>
              {/* show user name if it is in  all users
               */}
              {allUsers[hangout.userId] && (
                <p className="text-xs mt-5">
                  <em className="font-bold underline cursor-pointer mr-5">
                    {allUsers[hangout.userId]}
                  </em>
                </p>
              )}
              {/* <p>{hangout.userId}</p> */}
            </div>
            <div className="img   w-3/12 h-auto ">
              {/* <img src={hangout.img} alt="hangout" /> */}
              <SmallMap latLong={hangout.latLong} />
            </div>
          </div>
        ))}

      <ReactPaginate
        className="flex justify-center mt-6 gap-4 "
        pageCount={Math.ceil(filteredHangouts.length / itemsPerPage)}
        onPageChange={handlePageChange}
        containerClassName="pagination"
        activeClassName="text-green-500 font-bold scale-150"
        pageClassName="page-item"
        pageLinkClassName="page-link"
        previousClassName="page-item"
        previousLinkClassName="text-green-500 border border-green-500 rounded-md px-4 py-2 m-2 hover:bg-green-500 hover:text-white transition-all"
        nextClassName="page-item"
        nextLinkClassName="text-green-500 border border-green-500 rounded-md px-4 py-2 m-2 hover:bg-green-500 hover:text-white transition-all"
      />
    </div>
  );
}

export default Hangouts;
