export function enableTicketFilters() {

    const search = document.getElementById("searchTicket");
    const status = document.getElementById("filterStatus");
    const priority = document.getElementById("filterPriority");

    function filter() {

        const text = search.value.toLowerCase().trim();
        const statusValue = status.value;
        const priorityValue = priority.value;

        document.querySelectorAll(".ticket-table tbody tr").forEach(row => {

            const id = row.dataset.id || "";
            const title = row.dataset.title || "";
            const category = row.dataset.category || "";
            const reporter = row.dataset.reporter || "";
            const assigned = row.dataset.assigned || "";

            const matchesSearch =
                id.includes(text) ||
                title.includes(text) ||
                category.includes(text) ||
                reporter.includes(text) ||
                assigned.includes(text);
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