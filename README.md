# Quick Survey

The Quick Survey project is a work in progress survey system that aims to provide a modern and adaptable solution for creating and taking surveys.

## Getting Started

To get started with the Quick Survey project, follow these steps:

1. Clone the repository to your local machine.
2. Install Docker and Docker Compose if they are not already installed on your machine.
3. In the project root directory, run the following command to start the parse server and parse dashboard:
   ```
   docker-compose up -d
   ```
4. In the `app` directory, install the project dependencies by running the following command:
   ```
   npm install
   ```
5. Start the frontend development server by running the following command:
   ```
   VITE_SERVER_URL=http://localhost:1337/parse npm run dev
   ```
6. Access the application at `http://localhost:5173` and the Parse dashboard at `http://localhost:4040`.

## Creating and Taking Surveys

Questions and surveys can be created using the Parse dashboard. Surveys can be taken by visiting the URL `http://localhost:5173/s/<survey id>` in a web browser.

## Reporting Issues

If you encounter any issues with the Quick Survey project, please report them on the project's [GitHub issue tracker](https://github.com/thm-mni-ii/quick-survey/issues). 

## Contributing

This project is currently a work in progress, but contributions are welcome. If you are interested in contributing to the project, please contact the project maintainer for more information. 

## License

This project is licensed under the BSD 3 License. See the [LICENSE](LICENSE) file for more information.
