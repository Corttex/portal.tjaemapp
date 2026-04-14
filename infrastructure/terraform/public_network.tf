resource "aws_internet_gateway" "tjaem_igw" {
  vpc_id = aws_vpc.tjaem_vpc.id
  tags = { Name = "tjaem-igw" }
}

resource "aws_subnet" "tjaem_public_a" {
  vpc_id                  = aws_vpc.tjaem_vpc.id
  cidr_block              = "10.0.3.0/24"
  availability_zone       = "sa-east-1a"
  map_public_ip_on_launch = true
  tags = { Name = "tjaem-public-a" }
}

resource "aws_route_table" "tjaem_public_rt" {
  vpc_id = aws_vpc.tjaem_vpc.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.tjaem_igw.id
  }

  tags = { Name = "tjaem-public-rt" }
}

resource "aws_route_table_association" "tjaem_public_rta_a" {
  subnet_id      = aws_subnet.tjaem_public_a.id
  route_table_id = aws_route_table.tjaem_public_rt.id
}
