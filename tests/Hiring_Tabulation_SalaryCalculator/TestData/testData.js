/**
 * @author Md Noushad Ansari
 * Test Data — Salary Calculator (All Combinations)
 */

export const validdata = {
    username: 'thr_recruiter',
    password: '12345',
    baseUrl: 'https://next-gen-eob-ui-qa.teamlease.com/salary-calculator',
};

export const categories = [
    'Sales & AM',
    'Non Sales - Technology or Product',
    'Non Sales - Rest'
];

export const levels = [
    'L10','L1', 'L2', 'L3', 'L4', 'L5',
    'L6', 'L7', 'L8', 'L9', 'L10', 'LST'
];

// export const locations = [
//    'Mumbai', 'Chennai',
// ];

// HRA = 50% of Basic for these metro cities, 40% for rest
export const hraMetroCities = ['Mumbai', 'Chennai', 'Kolkata', 'Delhi'];

export const defaultAnnualFixed = '429861';

// GMC & GPA Premium (Per Annum) — depends on Level only
export const gmcGpaByLevel = {
     'L1': 2000, 'L2': 2000, 'L3': 2000, 'L4': 2000,
    'L5': 2000, 'L6': 2000, 'L7': 2000, 'L8': 2000, 'L9': 2000,
    'L10': 6000, 'LST': 6000, 
};

// GTLI Premium (Per Annum) — depends on Level only
export const gtliByLevel = {
     'L1': 2000, 'L2': 2000, 'L3': 2000, 'L4': 2000,
    'L5': 4000, 'L6': 4000, 'L7': 4000, 'L8': 10000, 'L9': 10000,
    'L10': 18000, 'LST': 18000, 
};



// export const gmcGpaByLevel = {
//     'CO': 2000, 'L1': 2000, 'L2': 2000, 'L3': 2000, 'L4': 2000,
//     'L5': 2000, 'L6': 2000, 'L7': 2000, 'L8': 2000, 'L9': 2000,
//     'L10': 6000, 'LST': 6000, 'T0': 2000
// };

// export const gtliByLevel = {
//     'CO': 2000, 'L1': 2000, 'L2': 2000, 'L3': 2000, 'L4': 2000,
//     'L5': 4000, 'L6': 4000, 'L7': 4000, 'L8': 10000, 'L9': 10000,
//     'L10': 18000, 'LST': 18000, 'T0': 2000
// };


// export const locations = [
//     'Mumbai', 'Chennai', 'Kolkata', 'Delhi', 'Hyderabad', 'Jharkhand'
// ];





// export const locations = [
//     'Ahmedabad', 'Bengaluru', 'Chennai', 'Delhi',
//     'Hyderabad', 'Kolkata', 'Mumbai', 'Pune', 'Vadodara',
//     'Andhra Pradesh', 'Haryana', 'Ernakulam', 'Bhopal',
//     'Central Gujarat', 'Gujarat', 'Guntur', 'Indore',
//     'Jaipur', 'Kerala', 'Kochi', 'Kolhapur', 'Bhiwandi',
//     'Madurai', 'Gandhinagar', 'Mysore', 'Nagpur', 'Solapur',
//     'Vijayawada', 'Tirupati', 'West - Ahmedabad', 'Trichy',
//     'Trivandrum', 'Uttarakhand', 'Manesar', 'Meerut',
//     'Mizoram', 'Mohali', 'Morbi', 'Nadiad', 'Noida',
//     'North - Bilaspur', 'Patna', 'Pithampur', 'Raipur',
//     'Rajkot', 'Ranchi', 'Sri City', 'Surat', 'Uluberia',
//     'Vallam', 'Valsad', 'Wardha', 'Aligarh', 'Bahadurgarh',
//     'Balasore', 'Bawal', 'Agartala', 'Bhubaneswar', 'Bhuj',
//     'Binola', 'Chandigarh', 'Darbhanga', 'Dehradun',
//     'Farukh Nagar Jahjjar', 'Gorakhpur', 'Gurgaon', 'Guwahati',
//     'Haldwani', 'Hamirpur', 'Jamshedpur', 'Kalol', 'Kanpur',
//     'Kurukshetra', 'Laksar', 'Jharkhand', 'Lucknow', 'Amritsar',
//     'Goa', 'Karagpur', 'Faridabad', 'Punjab', 'Assam',
//     'Zaheerabad', 'Ludhiana', 'Atali', 'Uttar Pradesh',
//     'Haridwar', 'Krishnagiri', 'Moradabad', 'Aizawl', 'Bihar',
//     'Orissa', 'Visakhapatnam', 'Barwani', 'Betul', 'Hathras',
//     'Tanuku', 'Dhanbad', 'Agra', 'Muzaffarpur', 'Coimbatore',
//     'Mangalore', 'Mathura', 'Vizag', 'Srinagar', 'Jammu',
//     'Imphal', 'Himachal Pradesh', 'Ratlam', 'Sonipat', 'Jind',
//     'Kannur', 'Siliguri', 'Sambalpur', 'Saharanpur', 'Jabalpur',
//     'Bharuch', 'Bareilly', 'Prayagraj', 'Rajahmundry', 'Kota',
//     'Bilaspur', 'Salem', 'Kottayam', 'Thrissur', 'Hosur',
//     'Pantnagar', 'Waluj', 'Alwar'
// ];


export const locations = [
    'Ahmedabad', 'Bengaluru', 'Chennai', 'Delhi',
    'Hyderabad', 'Kolkata', 'Mumbai', 'Pune', 'Vadodara',
    'Andhra Pradesh', 'Haryana', 'Ernakulam', 'Bhopal',
]