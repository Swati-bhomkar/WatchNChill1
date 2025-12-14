// src/pages/admin/ListUsers.jsx
import React, { useEffect, useState } from "react";
import Title from "./Title";
import { dateFormat } from "../../lib/dateFormat";
import { useAppContext } from "../../context/AppContext";
import { toast } from "react-hot-toast";

const ListUsers = () => {
  const { axios } = useAppContext();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const getAllUsers = async () => {
    try {
      const { data } = await axios.get("/api/admin/users");
      if (data.success) {
        setUsers(data.users || []);
      } else {
        toast.error(data.message || "Failed to load users");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error fetching users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAllUsers();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <>
      <Title text1="List" text2="Users" />

      <div className="max-w-6xl mt-6 overflow-x-auto">
        <table className="w-full border-collapse rounded-md overflow-hidden whitespace-nowrap">
          <thead>
            <tr className="bg-primary/20 text-left text-white">
              <th className="p-2 font-medium pl-5">Name</th>
              <th className="p-2 font-medium">Email</th>
              <th className="p-2 font-medium">Role</th>
              <th className="p-2 font-medium">Total Bookings</th>
              <th className="p-2 font-medium">Last Booking Date</th>
            </tr>
          </thead>
          <tbody className="text-sm font-light">
            {users.length === 0 && (
              <tr>
                <td colSpan="5" className="p-4 text-center text-gray-400">
                  No users found
                </td>
              </tr>
            )}

            {users.map((user) => (
              <tr
                key={user._id}
                className="border-b border-primary/20 bg-primary/5 even:bg-primary/10"
              >
                <td className="p-2 pl-5">{user.name || "—"}</td>
                <td className="p-2">{user.email || "—"}</td>
                <td className="p-2">{user.role || "—"}</td>
                <td className="p-2">{user.totalBookings || 0}</td>
                <td className="p-2">
                  {user.lastBookingDate
                    ? dateFormat(user.lastBookingDate)
                    : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default ListUsers;
