# Gym Substitution Manager

A web application for managing trainer substitutions at a gym. This tool helps track when trainers cover for each other and maintains a balance of who owes sessions to whom.

## Features

- **Trainer Management**: Add, update, and remove trainers
- **Substitution Tracking**: Record when one trainer covers for another
- **Balance System**: Automatically track and calculate who owes sessions to whom
- **Transaction History**: View a complete history of all substitutions

## Technology Stack

- **Frontend**: Next.js with React
- **Backend**: Next.js API routes with server actions
- **Database**: MongoDB
- **UI Components**: Custom UI components with variants
- **Styling**: Tailwind CSS

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MongoDB database (local or MongoDB Atlas)

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/gym-substitution-manager.git
cd gym-substitution-manager
```

2. Install dependencies
```bash
npm install
```

3. Create a `.env.local` file in the root directory with your MongoDB connection string:
```
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority
```

4. Start the development server
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Database Models

### Trainer
- `name`: String - Name of the trainer

### Substitution
- `absentTrainerId`: ObjectId - Trainer who was absent
- `substituteTrainerId`: ObjectId - Trainer who covered the session
- `date`: Date - Date of the substitution
- `notes`: String (optional) - Additional notes about the substitution

### Balance
- `trainerId`: ObjectId - Trainer who owes sessions
- `owesToTrainerId`: ObjectId - Trainer who is owed sessions
- `daysOwed`: Number - Number of sessions owed

## Usage

### Managing Trainers
- Add new trainers by entering their name
- Edit trainer names as needed
- Remove trainers (this will also remove all associated substitutions and balances)

### Recording Substitutions
- Select the absent trainer and the substitute trainer
- Choose the date of the substitution
- Add optional notes
- The system automatically updates the balance between trainers

### Viewing Balances
- See at a glance which trainers owe sessions to others
- The balance is automatically calculated based on recorded substitutions

## Notes

- This application is designed for use in environments where MongoDB transactions are not required (standalone MongoDB server)
- For production use with critical data, consider using a MongoDB replica set or MongoDB Atlas for transaction support

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- Built with Next.js and MongoDB
- UI components inspired by modern design systems
```

To save this as a README.md file in your project:

1. Copy the entire content above
2. Create a new file named `README.md` in the root directory of your project
3. Paste the content into this file
4. Save the file

You can create this file using any text editor or IDE you prefer, or through command line:

```bash
touch README.md
