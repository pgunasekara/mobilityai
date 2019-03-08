# Use an official Python runtime as a parent image
FROM python:3.7-stretch

# Set the working directory to /app
WORKDIR /app

# Copy the current directory contents into the container at /app
COPY . /app

# Install any needed packages specified in requirements.txt
RUN pip install pipenv
RUN pipenv install --skip-lock

# Make port 80 available to the world outside this container
EXPOSE 6000

# Define environment variable
ENV FLASK_ENV production

# Run app.py when the container launches
CMD ["pipenv", "run", "python", "app.py"]
