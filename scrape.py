majors = [
    "Aerospace Engineering", "Automotive Engineering", "Applied Computer Science", 
    "Applied Computing", "Artificial Intelligence", "Architecture", "Applied Data Science", 
    "Applied Mechanics", "Artifical Intelligence", "Electrical Engineering", "Business Analytics", 
    "Biomedical Engineering", "Business Analytics and Information Syste", "Business Analytics Flex", 
    "Biotechnology", "Business Administration", "Bioinformatics", "Business Intelligence and Analytics", 
    "Bioengineering", "Big Data", "Computer Science", "Civil Engineering", "Computer Engineering", 
    "Cyber Security", "Chemical Engineering", "Civil & Environmental Engineering", 
    "Computer & Information Science", "Construction Management", "Chemical and Petroleum Engineering", 
    "Computing Science", "Data Science", "Data Analytics", "Data Science and Business Analytics", 
    "Industrial Engineering", "Industrial and Systems Engineering", "Information Management and Systems", 
    "Electrical & Computer Engineering", "Engineering Management", "Electronics & Communication", "EECS", 
    "Environmental Engineering", "Engineering", "Environmental Mining", "Embedded Systems", 
    "Electrical and Electronics Engineering", "Finance", "Information Systems", "Software Engineering", 
    "Information Technology Management", "Information Technology", "Information Management", 
    "Game Development", "Mechanical Engineering", "Human Computer Interaction", "Health Informatics", 
    "Health Information Technology", "Human Resource Management", "Health Data Science", "Human Resource", 
    "Human Language Technology", "Information Science", "Information Technology and Analytics", 
    "Information Systems and Operations Manag", "Project Management", "Marketing", "Computer Networks", 
    "MIS", "Materials Science & Engineering", "Management of Technology", "Management", 
    "Manufacturing Engineering", "MBA", "Management Science and Engineering", "Machine Learning", 
    "Robotics", "Petroleum Engineering", "Public Health", "Pharmacy", "Pharmaceutical Science", 
    "Production Engineering", "Supply Chain Management", "Structural Engineering", 
    "Telecommunications Engineering", "Telecommunication Engineering", "Transportation Engineering", 
    "Toxicology", "Urban Studies"
]

# Sort the list alphabetically
sorted_majors = sorted(majors)

# Write sorted majors to a text file
with open("sorted_majors.txt", "w") as file:
    for major in sorted_majors:
        file.write(major + "\n")
