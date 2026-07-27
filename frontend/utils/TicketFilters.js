export function enableTicketFilters() {

    const search = document.getElementById("searchTicket");
    const status = document.getElementById("filterStatus");
    const priority = document.getElementById("filterPriority");

    function filter() {

        const text = search.value.toLowerCase().trim();
        const statusValue = status.value;
        const priorityValue = priority.value;

        document.querySelectorAll(".ticket-table tbody tr").forEach(row => {

            const matchesSearch =
                row.dataset.id.includes(text) ||
                row.dataset.title.includes(text) ||
                row.dataset.category.includes(text) ||
                row.dataset.reporter.includes(text) ||
                row.dataset.assigned.includes(text);

            const matchesStatus =
                !statusValue || row.dataset.status === statusValue;

            const matchesPriority =
                !priorityValue || row.dataset.priority === priorityValue;

            row.style.display =
                matchesSearch &&
                matchesStatus &&
                matchesPriority
                    ? ""
                    : "none";

        });

    }

    search.addEventListener("input", filter);
    status.addEventListener("change", filter);
    priority.addEventListener("change", filter);

}