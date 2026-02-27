import { useMemo, useState } from "react";
import StatusBadge from "../StatusBadge";
import type { RoomRecord, RoomStatus, RoomType } from "../../data/hmsMockData";

type RoomSortField = "roomNumber" | "pricePerNight";
type RoomSortDirection = "asc" | "desc";

type RoomListProps = {
  rooms: RoomRecord[];
  isLoading: boolean;
  isBulkDeleting: boolean;
  onAddNew: () => void;
  onView: (room: RoomRecord) => void;
  onEdit: (room: RoomRecord) => void;
  onDelete: (room: RoomRecord) => void;
  onBulkDelete: (roomIds: number[]) => void;
};

const PAGE_SIZE = 5;

const currencyFormatter = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  minimumFractionDigits: 0,
});

function RoomList({
  rooms,
  isLoading,
  onAddNew,
  onView,
  onEdit,
  onDelete,
}: RoomListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | RoomType>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | RoomStatus>("all");
  const [sortField, setSortField] = useState<RoomSortField>("roomNumber");
  const [sortDirection, setSortDirection] = useState<RoomSortDirection>("asc");
  const [page, setPage] = useState(1);

  const filteredRooms = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    return rooms.filter((room) => {
      if (
        normalizedSearch &&
        !room.roomNumber.toLowerCase().includes(normalizedSearch) &&
        !room.roomType.toLowerCase().includes(normalizedSearch)
      ) {
        return false;
      }

      if (typeFilter !== "all" && room.roomType !== typeFilter) {
        return false;
      }

      if (statusFilter !== "all" && room.status !== statusFilter) {
        return false;
      }

      return true;
    });
  }, [rooms, searchTerm, statusFilter, typeFilter]);

  const sortedRooms = useMemo(() => {
    const nextRooms = [...filteredRooms];
    nextRooms.sort((firstRoom, secondRoom) => {
      const comparisonValue =
        sortField === "roomNumber"
          ? Number(firstRoom.roomNumber) - Number(secondRoom.roomNumber)
          : firstRoom.pricePerNight - secondRoom.pricePerNight;

      return sortDirection === "asc" ? comparisonValue : -comparisonValue;
    });
    return nextRooms;
  }, [filteredRooms, sortDirection, sortField]);

  const pageCount = Math.max(1, Math.ceil(sortedRooms.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const paginatedRooms = sortedRooms.slice(startIndex, startIndex + PAGE_SIZE);

  const toggleSort = (field: RoomSortField) => {
    if (sortField === field) {
      setSortDirection((currentDirection) =>
        currentDirection === "asc" ? "desc" : "asc",
      );
      return;
    }

    setSortField(field);
    setSortDirection("asc");
  };

  return (
    <section className="hms-panel">
      <div className="hms-panel-head">
        <h3>Room Inventory</h3>
        <div className="hms-button-row">
          <button
            type="button"
            className="hms-primary-button"
            onClick={onAddNew}
          >
            Add New Room
          </button>
        </div>
      </div>

      <div className="hms-room-filter-grid">
        <label className="hms-field">
          Search
          <input
            value={searchTerm}
            onChange={(event) => {
              setSearchTerm(event.target.value);
              setPage(1);
            }}
            placeholder="Search room number or type"
          />
        </label>

        <label className="hms-field">
          Room Type
          <select
            value={typeFilter}
            onChange={(event) => {
              setTypeFilter(event.target.value as "all" | RoomType);
              setPage(1);
            }}
          >
            <option value="all">All</option>
            <option value="Single">Single</option>
            <option value="Double">Double</option>
            <option value="Suite">Suite</option>
            <option value="Deluxe">Deluxe</option>
          </select>
        </label>

        <label className="hms-field">
          Status
          <select
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(event.target.value as "all" | RoomStatus);
              setPage(1);
            }}
          >
            <option value="all">All</option>
            <option value="available">Available</option>
            <option value="occupied">Occupied</option>
            <option value="maintenance">Maintenance</option>
          </select>
        </label>

        <div className="hms-button-row hms-room-sort-controls">
          <button
            type="button"
            className="hms-ghost-button"
            onClick={() => toggleSort("roomNumber")}
          >
            Sort Room ({sortField === "roomNumber" ? sortDirection : "off"})
          </button>
          <button
            type="button"
            className="hms-ghost-button"
            onClick={() => toggleSort("pricePerNight")}
          >
            Sort Price ({sortField === "pricePerNight" ? sortDirection : "off"})
          </button>
        </div>
      </div>

      {isLoading ? (
        <p className="hms-empty-text">Loading rooms...</p>
      ) : (
        <div className="hms-table-wrap">
          <table className="hms-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Room ID</th>
                <th>Room Number</th>
                <th>Room Type</th>
                <th>Capacity</th>
                <th>Price/Night</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {paginatedRooms.length ? (
                paginatedRooms.map((room) => (
                  <tr key={room.id}>
                    <td>
                      <img
                        className="hms-room-thumb"
                        src={room.images[0] ?? "/rooms/standard-room.png"}
                        alt={`Room ${room.roomNumber}`}
                      />
                    </td>
                    <td>{room.id}</td>
                    <td>{room.roomNumber}</td>
                    <td>{room.roomType}</td>
                    <td>{room.capacity}</td>
                    <td className="hms-cell-right">
                      {currencyFormatter.format(room.pricePerNight)}
                    </td>
                    <td>
                      <StatusBadge status={room.status} />
                    </td>
                    <td>
                      <div className="hms-button-row">
                        <button
                          type="button"
                          className="hms-ghost-button"
                          onClick={() => onView(room)}
                        >
                          View
                        </button>
                        <button
                          type="button"
                          className="hms-ghost-button"
                          onClick={() => onEdit(room)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="hms-ghost-button"
                          onClick={() => onDelete(room)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="hms-table-empty">
                    No rooms found for current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <div className="hms-pagination">
        <button
          type="button"
          className="hms-ghost-button"
          onClick={() =>
            setPage((currentPageNumber) => Math.max(1, currentPageNumber - 1))
          }
          disabled={currentPage <= 1}
        >
          Previous
        </button>
        <span className="hms-empty-text">
          Page {currentPage} of {pageCount}
        </span>
        <button
          type="button"
          className="hms-ghost-button"
          onClick={() =>
            setPage((currentPageNumber) =>
              Math.min(pageCount, currentPageNumber + 1),
            )
          }
          disabled={currentPage >= pageCount}
        >
          Next
        </button>
      </div>
    </section>
  );
}

export default RoomList;
