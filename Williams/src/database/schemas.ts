type JobSite = {
    id: number,
    curr_materials: [Material], // an array of materials [{material_name: wood, amount: 200, unit: pcs}, ]
    requests: [Requests],
    deliveries: [Delivery],

}

/**
 * Example
 * {
 * material_name: "wood",
 * amount: 200,
 * unit: pcs,
 * }
 */

type Material = {
    material_name: string,
    amount: number,
    unit: string, // lbs, pcs, etc
}

type Requests = {
    date_requested: string,
    date_arrived: string,
    materials: [Material],
    priority: 1 | 2 | 3,
    id: number,
    status: "Requested" | "Ordered" | "Transit" | "Arrived",
    location: string,
}

type Delivery = {
    location: string,
    delivered_at: string,
    package_slip: string,
    contents: [Material],
}